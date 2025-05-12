from pydantic import BaseModel, ConfigDict


class AbstractBaseModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
