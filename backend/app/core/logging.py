import logging
import sys

# Configure standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("memora")

class MemoryLogger:
    @staticmethod
    def extract(msg: str):
        logger.info(f"\033[96m[MEMORY EXTRACT]\033[0m {msg}")

    @staticmethod
    def classify(msg: str):
        logger.info(f"\033[94m[MEMORY CLASSIFY]\033[0m {msg}")

    @staticmethod
    def conflict(msg: str):
        logger.info(f"\033[93m[MEMORY CONFLICT]\033[0m {msg}")

    @staticmethod
    def supersede(msg: str):
        logger.info(f"\033[91m[MEMORY SUPERSEDE]\033[0m {msg}")

    @staticmethod
    def store(msg: str):
        logger.info(f"\033[92m[MEMORY STORE]\033[0m {msg}")

    @staticmethod
    def retrieve(msg: str):
        logger.info(f"\033[95m[RETRIEVAL]\033[0m {msg}")

    @staticmethod
    def llm(msg: str):
        logger.info(f"\033[93m[LLM REASONING]\033[0m {msg}")
