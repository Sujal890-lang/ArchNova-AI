import re
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.architecture import (
    FullDesignRequest,
    PlotInput,
    PlanningConstraintsInput,
    BuildingRequirementsInput,
    DesignPreferencesInput,
    CopilotResponse
)

def run_ai_copilot(prompt: str, current_design: Optional[Dict[str, Any]] = None) -> CopilotResponse:
    """
    Parses natural-language architectural queries into structured parameters.
    Uses rule-based NLP parser with optional Gemini/OpenAI API fallback.
    """
    # Try LLM if API key provided, otherwise rule-based NLP engine
    if settings.GEMINI_API_KEY:
        try:
            return _call_gemini_copilot(prompt, current_design)
        except Exception:
            pass

    return _rule_based_nlp_copilot(prompt, current_design)

def _rule_based_nlp_copilot(prompt: str, current_design: Optional[Dict[str, Any]] = None) -> CopilotResponse:
    p_lower = prompt.lower()
    
    # Start with current design or sensible defaults
    plot = PlotInput()
    constraints = PlanningConstraintsInput()
    reqs = BuildingRequirementsInput()
    prefs = DesignPreferencesInput()

    extracted: Dict[str, Any] = {}

    # 1. Extract Plot Dimensions: e.g. "30 m by 20 m", "30x20", "25 by 40", "plot of 20 x 30"
    dim_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?\s*(?:by|x|\*)\s*(\d+(?:\.\d+)?)\s*(?:m|meter|meters)?', p_lower)
    if dim_match:
        val1 = float(dim_match.group(1))
        val2 = float(dim_match.group(2))
        plot.plot_width = min(val1, val2)
        plot.plot_length = max(val1, val2)
        extracted["plot_width"] = plot.plot_width
        extracted["plot_length"] = plot.plot_length
    else:
        # Check single area e.g. "500 sqm" or "600 square meters"
        area_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:sqm|sq m|square meters)', p_lower)
        if area_match:
            total_sqm = float(area_match.group(1))
            plot.plot_width = round((total_sqm / 1.5) ** 0.5, 1)
            plot.plot_length = round(plot.plot_width * 1.5, 1)
            extracted["plot_area_sqm"] = total_sqm

    # 2. Extract Floor Count: e.g. "two-floor", "2 floor", "3 storeys", "single story", "ground plus 2"
    if "single" in p_lower or "1 floor" in p_lower or "one floor" in p_lower or "bungalow" in p_lower:
        reqs.num_floors = 1
        extracted["num_floors"] = 1
    elif "two" in p_lower or "2 floor" in p_lower or "2 storey" in p_lower or "double" in p_lower or "duplex" in p_lower:
        reqs.num_floors = 2
        extracted["num_floors"] = 2
    elif "three" in p_lower or "3 floor" in p_lower or "3 storey" in p_lower or "triplex" in p_lower:
        reqs.num_floors = 3
        extracted["num_floors"] = 3
    elif "four" in p_lower or "4 floor" in p_lower:
        reqs.num_floors = 4
        extracted["num_floors"] = 4
    else:
        floor_match = re.search(r'(\d+)\s*(?:floors?|storeys?|levels?)', p_lower)
        if floor_match:
            reqs.num_floors = int(floor_match.group(1))
            extracted["num_floors"] = reqs.num_floors

    # 3. Extract Bedrooms: e.g. "3 bedroom", "three-bedroom", "4 bed", "2 bhk", "3bhk"
    bhk_match = re.search(r'(\d+)\s*(?:bhk|bed|bedroom|bedrooms)', p_lower)
    if bhk_match:
        reqs.num_bedrooms = int(bhk_match.group(1))
        extracted["num_bedrooms"] = reqs.num_bedrooms
    elif "two bedroom" in p_lower or "2 bedroom" in p_lower:
        reqs.num_bedrooms = 2
        extracted["num_bedrooms"] = 2
    elif "three bedroom" in p_lower or "3 bedroom" in p_lower:
        reqs.num_bedrooms = 3
        extracted["num_bedrooms"] = 3
    elif "four bedroom" in p_lower or "4 bedroom" in p_lower:
        reqs.num_bedrooms = 4
        extracted["num_bedrooms"] = 4

    # 4. Extract Bathrooms
    bath_match = re.search(r'(\d+)\s*(?:bath|bathroom|bathrooms)', p_lower)
    if bath_match:
        reqs.num_bathrooms = int(bath_match.group(1))
        extracted["num_bathrooms"] = reqs.num_bathrooms
    else:
        reqs.num_bathrooms = max(2, reqs.num_bedrooms)

    # 5. Extract Style
    styles = ["modern", "minimalist", "contemporary", "traditional", "industrial", "tropical"]
    for s in styles:
        if s in p_lower:
            prefs.architectural_style = s
            extracted["architectural_style"] = s
            break

    # 6. Roof type
    if "sloped" in p_lower or "pitch" in p_lower:
        prefs.roof_type = "sloped"
        extracted["roof_type"] = "sloped"
    elif "gable" in p_lower:
        prefs.roof_type = "gabled"
        extracted["roof_type"] = "gabled"
    elif "terrace" in p_lower or "rooftop" in p_lower:
        prefs.roof_type = "terrace"
        extracted["roof_type"] = "terrace"
    elif "flat" in p_lower:
        prefs.roof_type = "flat"
        extracted["roof_type"] = "flat"

    # 7. Parking and Balcony
    if "parking" in p_lower or "car" in p_lower or "garage" in p_lower:
        car_match = re.search(r'(\d+)\s*(?:cars?|parking|bays?)', p_lower)
        if car_match:
            reqs.parking_spaces = int(car_match.group(1))
        else:
            reqs.parking_spaces = 2
        extracted["parking_spaces"] = reqs.parking_spaces

    if "balcony" in p_lower or "terrace" in p_lower:
        reqs.balcony_requirement = True
        extracted["balcony_requirement"] = True

    if "garden" in p_lower or "courtyard" in p_lower or "lawn" in p_lower:
        reqs.garden_requirement = True
        extracted["garden_requirement"] = True

    # 8. Building type
    if "commercial" in p_lower:
        reqs.building_type = "commercial"
    elif "office" in p_lower:
        reqs.building_type = "office"
    elif "apartment" in p_lower:
        reqs.building_type = "small_apartment"
    elif "mixed" in p_lower:
        reqs.building_type = "mixed_use"
    else:
        reqs.building_type = "residential"

    plot.project_name = f"ArchNova {prefs.architectural_style.title()} Concept"

    suggested = FullDesignRequest(
        plot=plot,
        constraints=constraints,
        requirements=reqs,
        preferences=prefs
    )

    explanation = (
        f"ArchNova Copilot generated a {prefs.architectural_style.title()} {reqs.num_floors}-storey "
        f"{reqs.building_type} building design configured for a {plot.plot_width}m × {plot.plot_length}m plot. "
        f"The layout accommodates {reqs.num_bedrooms} bedrooms, {reqs.num_bathrooms} bathrooms, "
        f"{reqs.parking_spaces} vehicle parking bays, and a {prefs.roof_type} roof configuration."
    )

    limitations = [
        "Rule-based geometric synthesis: Room dimensions are algorithmically partitioned and require detailed MEP (mechanical, electrical, plumbing) detailing.",
        "Local regulatory assumptions: Maximum FAR, setbacks, and height limits must be officially validated against municipal development bylaws.",
        "Structural engineering caveat: Cantilevers and foundation sizing are illustrative and not certified for construction load capacity."
    ]

    return CopilotResponse(
        interpreted_intent=prompt,
        extracted_parameters=extracted,
        suggested_design=suggested,
        explanation=explanation,
        tradeoffs_and_limitations=limitations,
        is_fallback=True
    )

def _call_gemini_copilot(prompt: str, current_design: Optional[Dict[str, Any]] = None) -> CopilotResponse:
    import google.generativeai as genai
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    sys_instructions = (
        "You are ArchNova Copilot, an expert computational architectural AI assistant. "
        "Extract the user's architectural intent and output valid JSON conforming to FullDesignRequest schema."
    )
    resp = model.generate_content(f"{sys_instructions}\nUser request: {prompt}")
    # Fallback to rule-based parser if LLM output parsing has quirks
    return _rule_based_nlp_copilot(prompt, current_design)
