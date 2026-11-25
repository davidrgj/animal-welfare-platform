#!/usr/bin/env python3
"""Compatibility entrypoint: surgically patch the approved informe PDF.

Does not regenerate the Word report or invent a new layout. See patch_informe_original.py.
"""

from patch_informe_original import main

if __name__ == "__main__":
    main()
