import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = {
  // 1. Send chat message to AI
  chat: (message, history) => axios.post(`${API_URL}/chat`, { message, history }),
  
  // 2. Run the simulation (The Heavy Lifting)
  runSimulation: (script) => axios.post(`${API_URL}/run-simulation`, { script_code: script }),
  
  // 3. Save strategy to database
  saveStrategy: (name, script) => axios.post(`${API_URL}/strategy/save`, { name, script })
};