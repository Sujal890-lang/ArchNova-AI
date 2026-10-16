import { generateLocalParametricDesign, calculatePlanningMetrics } from '../utils/parametricFallback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('archnova_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('archnova_token', token);
    } else {
      localStorage.removeItem('archnova_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async generateDesign(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/designs/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, using client-side parametric engine:", e);
    }
    // Fallback to local deterministic generator
    return generateLocalParametricDesign(
      payload.plot,
      payload.constraints,
      payload.requirements,
      payload.preferences
    );
  }

  async validateConstraints(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/designs/validate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable, using client-side validation:", e);
    }
    return calculatePlanningMetrics(payload.plot, payload.constraints, payload.requirements);
  }

  async generateFloorplans(params) {
    try {
      const res = await fetch(`${API_BASE_URL}/floorplans/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend API unavailable for floorplans:", e);
    }
    // Generate basic deterministic client floorplan
    return {
      building_width: params.building_width,
      building_depth: params.building_depth,
      total_floors: params.num_floors,
      can_fit_program: true,
      floors: Array.from({ length: params.num_floors }, (_, idx) => ({
        floor_index: idx,
        floor_name: idx === 0 ? "Ground Floor" : `Level ${idx + 1}`,
        width: params.building_width,
        depth: params.building_depth,
        rooms: [
          { id: `r_${idx}_1`, name: idx === 0 ? "Living & Lounge" : "Master Bedroom Suite", x: 0.2, y: 0.2, width: params.building_width * 0.6, depth: params.building_depth * 0.45, area_sqm: Math.round(params.building_width * params.building_depth * 0.27), color: "#FEF3C7" },
          { id: `r_${idx}_2`, name: idx === 0 ? "Dining & Kitchen" : "Guest Bedroom", x: params.building_width * 0.62, y: 0.2, width: params.building_width * 0.35, depth: params.building_depth * 0.45, area_sqm: Math.round(params.building_width * params.building_depth * 0.15), color: "#E0E7FF" },
          { id: `r_${idx}_3`, name: idx === 0 ? "Kitchen & Pantry" : "En-suite Bath", x: 0.2, y: params.building_depth * 0.5, width: params.building_width * 0.45, depth: params.building_depth * 0.45, area_sqm: Math.round(params.building_width * params.building_depth * 0.2), color: "#CFFAFE" },
          { id: `r_${idx}_4`, name: idx === 0 ? "Powder Room & Foyer" : "Bedroom 2", x: params.building_width * 0.48, y: params.building_depth * 0.5, width: params.building_width * 0.48, depth: params.building_depth * 0.45, area_sqm: Math.round(params.building_width * params.building_depth * 0.21), color: "#D1FAE5" }
        ],
        walls: [
          { x1: 0, y1: 0, x2: params.building_width, y2: 0, type: "exterior" },
          { x1: params.building_width, y1: 0, x2: params.building_width, y2: params.building_depth, type: "exterior" },
          { x1: params.building_width, y1: params.building_depth, x2: 0, y2: params.building_depth, type: "exterior" },
          { x1: 0, y1: params.building_depth, x2: 0, y2: 0, type: "exterior" }
        ],
        doors: [{ x: params.building_width / 2, y: 0, width: 1.2 }],
        windows: [{ x: params.building_width * 0.3, y: 0, width: 2.0, orientation: "horizontal" }]
      }))
    };
  }

  async getFloorplanSvg(params, floor = 0) {
    try {
      const res = await fetch(`${API_BASE_URL}/floorplans/svg?floor=${floor}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params)
      });
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      console.warn("Backend SVG endpoint unavailable:", e);
    }
    return null;
  }

  async queryCopilot(prompt, currentDesign = null) {
    try {
      const res = await fetch(`${API_BASE_URL}/designs/copilot`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt, current_design: currentDesign })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend Copilot API error:", e);
    }
    // Local NLP parser fallback
    const p = prompt.toLowerCase();
    const floors = p.includes('3 floor') || p.includes('three') ? 3 : (p.includes('single') || p.includes('1 floor') ? 1 : 2);
    const beds = p.includes('4 bed') || p.includes('four') ? 4 : (p.includes('2 bed') || p.includes('two') ? 2 : 3);
    const style = p.includes('minimalist') ? 'minimalist' : (p.includes('tropical') ? 'tropical' : (p.includes('industrial') ? 'industrial' : 'modern'));
    
    return {
      interpreted_intent: prompt,
      extracted_parameters: { num_floors: floors, num_bedrooms: beds, architectural_style: style },
      suggested_design: {
        plot: { project_name: `ArchNova ${style.toUpperCase()} AI Concept`, plot_width: 22, plot_length: 30 },
        constraints: { max_height: 12, front_setback: 3.5, rear_setback: 3, left_setback: 2, right_setback: 2, max_far: 1.8, max_site_coverage: 60, max_floors: 3, parking_spaces_required: 2 },
        requirements: { building_type: 'residential', num_bedrooms: beds, num_bathrooms: beds, num_floors: floors, parking_spaces: 2, balcony_requirement: true, garden_requirement: true, terrace_requirement: true, staircase_requirement: true, lift_requirement: false },
        preferences: { architectural_style: style, roof_type: 'flat', window_style: 'ribbon', exterior_material: 'concrete_white_stucco', exterior_color: 'warm_offwhite', balcony_style: 'cantilever_glass', landscaping_style: 'geometric_courtyard' }
      },
      explanation: `ArchNova Copilot synthesized a ${style} ${floors}-level architecture concept with ${beds} bedrooms and integrated parking.`,
      tradeoffs_and_limitations: ["Preliminary spatial layout: detailed structural analysis required.", "Check setback restrictions with local municipal authority."]
    };
  }

  async getProjects() {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        headers: this.getHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch projects from backend:", e);
    }
    // Read from localStorage
    const saved = localStorage.getItem('archnova_local_projects');
    return saved ? JSON.parse(saved) : [];
  }

  async saveProject(projectData) {
    try {
      const res = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Could not save to backend, storing in localStorage:", e);
    }
    const projects = await this.getProjects();
    const newProj = {
      ...projectData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    projects.unshift(newProj);
    localStorage.setItem('archnova_local_projects', JSON.stringify(projects));
    return newProj;
  }

  async deleteProject(id) {
    try {
      await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
    } catch (e) {
      console.warn("Backend delete error:", e);
    }
    const projects = await this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem('archnova_local_projects', JSON.stringify(filtered));
    return { status: "success" };
  }

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(email, password, fullName) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    this.setToken(data.access_token);
    return data;
  }
}

export const api = new ApiService();
export default api;
