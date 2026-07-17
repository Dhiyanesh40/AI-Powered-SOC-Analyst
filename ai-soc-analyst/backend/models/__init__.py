# Import all models here so that Base.metadata.create_all() discovers them.

from models.security_log import SecurityLog              # noqa: F401
from models.analysis_result import AnalysisResult        # noqa: F401
from models.generated_report import GeneratedReport      # noqa: F401
