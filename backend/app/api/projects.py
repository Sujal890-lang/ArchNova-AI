from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from app.api.deps import get_db, get_current_user_optional
from app.models.project import Project
from app.models.user import User

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str = "Untitled Architectural Project"
    description: Optional[str] = None
    plot_data: Dict[str, Any]
    constraints_data: Dict[str, Any]
    requirements_data: Dict[str, Any]
    preferences_data: Dict[str, Any]
    design_output: Optional[Dict[str, Any]] = None
    floorplan_output: Optional[Dict[str, Any]] = None
    validation_output: Optional[Dict[str, Any]] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    plot_data: Optional[Dict[str, Any]] = None
    constraints_data: Optional[Dict[str, Any]] = None
    requirements_data: Optional[Dict[str, Any]] = None
    preferences_data: Optional[Dict[str, Any]] = None
    design_output: Optional[Dict[str, Any]] = None
    floorplan_output: Optional[Dict[str, Any]] = None
    validation_output: Optional[Dict[str, Any]] = None

def get_or_create_demo_user(db: Session) -> User:
    demo = db.query(User).filter(User.email == "demo@archnova.ai").first()
    if not demo:
        from app.core.security import get_password_hash
        demo = User(
            email="demo@archnova.ai",
            hashed_password=get_password_hash("ArchNovaDemo2026!"),
            full_name="ArchNova Guest Studio"
        )
        db.add(demo)
        db.commit()
        db.refresh(demo)
    return demo

@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user = current_user or get_or_create_demo_user(db)
    project = Project(
        user_id=user.id,
        name=project_in.name,
        description=project_in.description,
        plot_data=project_in.plot_data,
        constraints_data=project_in.constraints_data,
        requirements_data=project_in.requirements_data,
        preferences_data=project_in.preferences_data,
        design_output=project_in.design_output,
        floorplan_output=project_in.floorplan_output,
        validation_output=project_in.validation_output
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("")
def list_projects(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user = current_user or get_or_create_demo_user(db)
    projects = db.query(Project).filter(Project.user_id == user.id).order_by(Project.updated_at.desc()).all()
    return projects

@router.get("/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}")
def update_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"status": "success", "message": f"Project {project_id} deleted."}

@router.post("/{project_id}/duplicate")
def duplicate_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    original = db.query(Project).filter(Project.id == project_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Project not found")

    user = current_user or get_or_create_demo_user(db)
    duplicated = Project(
        user_id=user.id,
        name=f"{original.name} (Copy)",
        description=original.description,
        plot_data=original.plot_data,
        constraints_data=original.constraints_data,
        requirements_data=original.requirements_data,
        preferences_data=original.preferences_data,
        design_output=original.design_output,
        floorplan_output=original.floorplan_output,
        validation_output=original.validation_output
    )
    db.add(duplicated)
    db.commit()
    db.refresh(duplicated)
    return duplicated
