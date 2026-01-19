# app/main.py
from fastapi import FastAPI, HTTPException
from app.engine.simulator import run_hedge_fund_simulation
from app.agents.reasoner import explain_results

app = FastAPI()

@app.post("/run-simulation")
async def execute_strategy(user_id: str, script_code: str):
    
    # 1. EXECUTE: Run the Python script in a controlled sandbox
    # This function calculates the "Excel" numbers deterministically
    raw_data = run_hedge_fund_simulation(script_code) 

    # 2. ANALYZE: Calculate the 3 Scenarios (Math only)
    scenarios = {
        "best_case": raw_data['final_equity'] * 1.2,  # Example logic
        "avg_case": raw_data['final_equity'],
        "worst_case": raw_data['final_equity'] * 0.85
    }

    # 3. REASON: Send numbers to the AI Agent to generate the text
    # "Why did the worst case happen?" -> AI looks at the -15% and volatility
    explanation = explain_results(scenarios, raw_data['metrics'])

    return {
        "charts": raw_data['equity_curve'],
        "excel_grid": raw_data['trade_log'],
        "scenarios": scenarios,
        "ai_reasoning": explanation
    }