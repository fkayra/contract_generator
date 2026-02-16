from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional
from docxtpl import DocxTemplate
from datetime import datetime
import os
from pathlib import Path

app = FastAPI(title="Contract Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SalaryPayment(BaseModel):
    date: str
    amount: str

class Season(BaseModel):
    name: str
    total_amount: str
    payments: List[SalaryPayment]

class ContractRequest(BaseModel):
    name: str
    currency: str
    country: str
    current_season: str
    number_of_seasons: int
    salary_payment_count: int
    salary_payments: List[SalaryPayment]
    total_salary_per_season: str
    bonuses_not_cumulative: bool

    # Player info
    player_name: Optional[str] = None
    position: Optional[str] = None

    # Club info
    club_name: Optional[str] = None
    club_address: Optional[str] = None

    # Agent info
    agent_name: Optional[str] = None
    agent_number: Optional[str] = None
    agent_phone: Optional[str] = None
    fiba_license: Optional[str] = None
    other_agent: Optional[str] = None

    # Dates
    contract_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

    # Buyouts
    team_buyout: bool = False
    team_buyout_days: Optional[int] = None
    team_buyout_amount: Optional[str] = None
    player_buyout: bool = False
    player_buyout_date: Optional[str] = None
    player_buyout_amount: Optional[str] = None

    # Bonuses
    achievement: Optional[str] = None
    bonus_amount: Optional[str] = None
    competition: Optional[str] = None

    # Benefits
    number_of_tickets: Optional[int] = None
    ticket_class: Optional[str] = None
    number_of_bedrooms: Optional[int] = None

    # Contact
    email_address: Optional[str] = None

    # League info
    league_name: Optional[str] = None
    league_address: Optional[str] = None

def calculate_seasons(current_season: str, number_of_seasons: int) -> tuple:
    start_year = int(current_season.split('/')[0])

    seasons = []
    for i in range(number_of_seasons):
        year = start_year + i
        next_year = year + 1
        season_name = f"{year}/{str(next_year)[-2:]}"
        seasons.append(season_name)

    additional_seasons = seasons[1:] if len(seasons) > 1 else []
    last_season = seasons[-1]

    return seasons, additional_seasons, last_season

def prepare_season_data(seasons: List[str], salary_payments: List[SalaryPayment],
                       total_salary: str, salary_payment_count: int) -> List[dict]:
    season_data = []

    for season_name in seasons:
        payments = salary_payments[:salary_payment_count]

        season_data.append({
            'name': season_name,
            'total_amount': total_salary,
            'payments': [{'date': p.date, 'amount': p.amount} for p in payments]
        })

    return season_data

@app.get("/")
async def root():
    return {
        "message": "Contract Generator API",
        "endpoints": {
            "POST /generate": "Generate contract document"
        }
    }

@app.post("/generate")
async def generate_contract(request: ContractRequest):
    try:
        template_path = Path("templates/Team_Contract_2025_26_AI_(1)_(1).docx")

        if not template_path.exists():
            raise HTTPException(status_code=500, detail="Template file not found")

        doc = DocxTemplate(template_path)

        seasons_list, additional_seasons, last_season = calculate_seasons(
            request.current_season,
            request.number_of_seasons
        )

        season_1 = seasons_list[0] if len(seasons_list) > 0 else ""
        season_2 = seasons_list[1] if len(seasons_list) > 1 else ""

        season_data = prepare_season_data(
            seasons_list,
            request.salary_payments,
            request.total_salary_per_season,
            request.salary_payment_count
        )

        context = {
            # Basic info
            'name': request.name,
            'player_name': request.player_name or request.name,
            'position': request.position or '',

            # Club info
            'club_name': request.club_name or '',
            'club_address': request.club_address or '',

            # Agent info
            'agent_name': request.agent_name or '',
            'agent_number': request.agent_number or '',
            'agent_phone': request.agent_phone or '',
            'fiba_license': request.fiba_license or '',
            'other_agent': request.other_agent if request.other_agent else None,

            # Financial
            'currency': request.currency,
            'country': request.country,
            'total_salary_per_season': request.total_salary_per_season,

            # Seasons
            'current_season': request.current_season,
            'number_of_seasons': request.number_of_seasons,
            'season_1': season_1,
            'season_2': season_2,
            'last_season': last_season,
            'additional_seasons': additional_seasons,
            'seasons': season_data,

            # Dates
            'contract_date': request.contract_date or '',
            'start_date': request.start_date or '',
            'end_date': request.end_date or '',

            # Buyouts
            'team_buyout': request.team_buyout,
            'team_buyout_days': request.team_buyout_days or '',
            'team_buyout_amount': request.team_buyout_amount or '',
            'player_buyout': request.player_buyout,
            'player_buyout_date': request.player_buyout_date or '',
            'player_buyout_amount': request.player_buyout_amount or '',

            # Bonuses
            'bonuses_not_cumulative': request.bonuses_not_cumulative,
            'achievement': request.achievement or '',
            'bonus_amount': request.bonus_amount or '',
            'competition': request.competition or '',

            # Benefits
            'number_of_tickets': request.number_of_tickets or '',
            'ticket_class': request.ticket_class or '',
            'number_of_bedrooms': request.number_of_bedrooms or '',

            # Contact
            'email_address': request.email_address or '',

            # League
            'league_name': request.league_name or '',
            'league_address': request.league_address or '',
        }

        doc.render(context)

        output_path = Path("output") / f"contract_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        output_path.parent.mkdir(exist_ok=True)

        doc.save(output_path)

        return FileResponse(
            path=output_path,
            filename="contract.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating contract: {str(e)}")

class PaymentInstallment(BaseModel):
    installment_number: int
    amount: float
    due_date: str

class Buyout(BaseModel):
    amount: float
    deadline: str

class SimpleContractRequest(BaseModel):
    player_name: str
    player_passport: str
    player_birth_date: str
    player_birth_place: str
    player_address: str
    player_tax_number: str
    contract_date: str
    contract_start_date: str
    contract_end_date: str
    jersey_number: str
    total_salary: float
    payment_schedule: List[PaymentInstallment]
    team_buyout: Optional[Buyout] = None
    player_buyout: Optional[Buyout] = None

@app.post("/generate-contract")
async def generate_simple_contract(request: SimpleContractRequest):
    try:
        template_path = Path("templates/Team_Contract_2025_26_AI_(1)_(1)_MODIFIED.docx")

        if not template_path.exists():
            raise HTTPException(status_code=500, detail="Template file not found")

        doc = DocxTemplate(template_path)

        total_salary_formatted = f"{request.total_salary:,.2f}"

        payment_details = []
        for payment in request.payment_schedule:
            payment_details.append({
                'number': payment.installment_number,
                'amount': f"{payment.amount:,.2f}",
                'date': payment.due_date
            })

        context = {
            'player_name': request.player_name,
            'player_passport': request.player_passport,
            'player_birth_date': request.player_birth_date,
            'player_birth_place': request.player_birth_place,
            'player_address': request.player_address,
            'player_tax_number': request.player_tax_number,
            'contract_date': request.contract_date,
            'contract_start_date': request.contract_start_date,
            'contract_end_date': request.contract_end_date,
            'jersey_number': request.jersey_number,
            'total_salary': total_salary_formatted,
            'payment_schedule': payment_details,
            'has_team_buyout': request.team_buyout is not None,
            'team_buyout_amount': f"{request.team_buyout.amount:,.2f}" if request.team_buyout else "",
            'team_buyout_deadline': request.team_buyout.deadline if request.team_buyout else "",
            'has_player_buyout': request.player_buyout is not None,
            'player_buyout_amount': f"{request.player_buyout.amount:,.2f}" if request.player_buyout else "",
            'player_buyout_deadline': request.player_buyout.deadline if request.player_buyout else "",
        }

        doc.render(context)

        output_path = Path("output") / f"contract_{request.player_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        output_path.parent.mkdir(exist_ok=True)

        doc.save(output_path)

        return FileResponse(
            path=output_path,
            filename=f"contract_{request.player_name.replace(' ', '_')}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating contract: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
