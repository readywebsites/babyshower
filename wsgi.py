"""
WSGI entrypoint for babyshower Django project.
"""
import os
from babyshower.wsgi import application, app

__all__ = ['application', 'app']
