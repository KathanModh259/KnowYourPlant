import requests
import os
from fastapi import UploadFile
from dotenv import load_dotenv

load_dotenv()

PLANTNET_API_KEY = os.getenv("PLANTNET_API_KEY", "")
PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all"


async def predict_image(file: UploadFile):
    if not PLANTNET_API_KEY:
        return {"error": "PLANTNET_API_KEY not set in backend/.env"}

    image_data = await file.read()

    try:
        resp = requests.post(
            PLANTNET_URL,
            params={"api-key": PLANTNET_API_KEY, "lang": "en"},
            files=[("images", (file.filename or "plant.jpg", image_data, file.content_type or "image/jpeg"))],
            data={"organs": "auto"},
            timeout=30,
        )

        if resp.status_code == 400 and "organs" in resp.text.lower():
            resp = requests.post(
                PLANTNET_URL,
                params={"api-key": PLANTNET_API_KEY, "lang": "en"},
                files=[("images", (file.filename or "plant.jpg", image_data, file.content_type or "image/jpeg"))],
                data={"organs": "leaf"},
                timeout=30,
            )

        if resp.status_code == 404:
            return {
                "plant_name": "Unknown Plant", "scientific_name": "Not identified",
                "confidence": 0, "description": "Could not identify this plant.",
                "care_tips": [], "uses": [], "habitat": "", "is_toxic": False,
            }

        if resp.status_code != 200:
            return {"error": f"API error ({resp.status_code}): {resp.text[:200]}"}

        data = resp.json()
        results = data.get("results", [])

        if not results:
            return {
                "plant_name": "Unknown Plant", "scientific_name": "Not identified",
                "confidence": 0, "description": "No match found. Try a clearer photo.",
                "care_tips": [], "uses": [], "habitat": "", "is_toxic": False,
            }

        top = results[0]
        species = top.get("species", {})
        score = top.get("score", 0)
        sci_name = species.get("scientificNameWithoutAuthor", "Unknown")
        common_names = species.get("commonNames", [])
        plant_name = common_names[0] if common_names else sci_name
        family = species.get("family", {}).get("scientificNameWithoutAuthor", "")
        genus = species.get("genus", {}).get("scientificNameWithoutAuthor", "")

        desc = f"{plant_name} ({sci_name})"
        if genus: desc += f", genus {genus}"
        if family: desc += f", family {family}"
        if len(common_names) > 1: desc += f". Also known as: {', '.join(common_names[:3])}"
        desc += "."

        predictions = []
        for r in results[:5]:
            sp = r.get("species", {})
            cn = sp.get("commonNames", [])
            predictions.append({
                "class": cn[0] if cn else sp.get("scientificNameWithoutAuthor", "Unknown"),
                "scientific_name": sp.get("scientificNameWithoutAuthor", ""),
                "confidence": r.get("score", 0),
                "family": sp.get("family", {}).get("scientificNameWithoutAuthor", ""),
            })

        return {
            "plant_name": plant_name, "scientific_name": sci_name,
            "confidence": score, "description": desc,
            "family": family, "genus": genus,
            "common_names": common_names[:5],
            "habitat": f"Family: {family}, Genus: {genus}" if family else "",
            "care_tips": [], "uses": [], "is_toxic": False,
            "predictions": predictions,
        }
    except requests.exceptions.Timeout:
        return {"error": "Timed out. Try again."}
    except Exception as e:
        return {"error": f"Failed: {str(e)}"}
