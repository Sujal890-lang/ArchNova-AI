from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False, default="Untitled Architectural Project")
    description = Column(Text, nullable=True)
    
    # Structured input payloads
    plot_data = Column(JSON, nullable=False, default=dict)
    constraints_data = Column(JSON, nullable=False, default=dict)
    requirements_data = Column(JSON, nullable=False, default=dict)
    preferences_data = Column(JSON, nullable=False, default=dict)
    
    # Generated outputs
    design_output = Column(JSON, nullable=True)
    floorplan_output = Column(JSON, nullable=True)
    validation_output = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="projects")
