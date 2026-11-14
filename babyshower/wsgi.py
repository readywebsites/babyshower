"""
WSGI config for babyshower project.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'babyshower.settings')

application = get_wsgi_application()
app = application  # Alias for common WSGI runners
