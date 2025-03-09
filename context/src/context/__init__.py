from .server import run
# import os
import asyncio


def main() -> None:
    # os.system("notify-send 'example server started'")
    asyncio.run(run())
