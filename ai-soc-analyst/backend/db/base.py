from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Declarative base class for all ORM models.

    All models inherit from this class so that
    Base.metadata.create_all() discovers every table.
    """

    pass
