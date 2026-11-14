import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import PollVote, Wish, RSVP

def home_view(request):
    """Serves the main Baby Shower Invitation single-page site"""
    return render(request, 'index.html')


@csrf_exempt
def poll_api(request):
    """Live API for Boy or Girl gender prediction poll"""
    if request.method == 'GET':
        boy_count = PollVote.objects.filter(choice='boy').count()
        girl_count = PollVote.objects.filter(choice='girl').count()
        return JsonResponse({
            'boy': boy_count,
            'girl': girl_count,
            'total': boy_count + girl_count
        })

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        choice = str(data.get('choice', '')).lower().strip()
        if choice not in ['boy', 'girl']:
            return JsonResponse({'error': 'Choice must be boy or girl'}, status=400)

        ip = request.META.get('HTTP_X_FORWARDED_FOR')
        if ip:
            ip = ip.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')

        PollVote.objects.create(choice=choice, voter_ip=ip)

        boy_count = PollVote.objects.filter(choice='boy').count()
        girl_count = PollVote.objects.filter(choice='girl').count()
        return JsonResponse({
            'success': True,
            'boy': boy_count,
            'girl': girl_count,
            'total': boy_count + girl_count
        })

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def wishes_api(request):
    """Live API for Guestbook Wishes & Blessings"""
    if request.method == 'GET':
        wishes = Wish.objects.all()[:150]
        data = []
        for w in wishes:
            data.append({
                'id': w.id,
                'name': w.name,
                'text': w.message,
                'likes': w.likes,
                'time': w.created_at.strftime('%d %b, %I:%M %p')
            })
        return JsonResponse(data, safe=False)

    elif request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        name = str(data.get('name', '')).strip()
        text = str(data.get('text', '')).strip()
        if not name or not text:
            return JsonResponse({'error': 'Name and text required'}, status=400)

        wish = Wish.objects.create(name=name, message=text, likes=1)
        return JsonResponse({
            'success': True,
            'wish': {
                'id': wish.id,
                'name': wish.name,
                'text': wish.message,
                'likes': wish.likes,
                'time': 'Just now'
            }
        })

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def wish_like_api(request, wish_id):
    """Live API to increment like on a specific blessing"""
    if request.method == 'POST':
        try:
            wish = Wish.objects.get(id=wish_id)
            wish.likes += 1
            wish.save(update_fields=['likes'])
            return JsonResponse({'success': True, 'likes': wish.likes})
        except Wish.DoesNotExist:
            return JsonResponse({'error': 'Wish not found'}, status=404)
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def rsvp_api(request):
    """Live API for RSVP confirmation"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
        except Exception:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        name = str(data.get('name', '')).strip()
        try:
            guests = int(data.get('guests', 1) or 1)
        except (ValueError, TypeError):
            guests = 1

        status = str(data.get('status', 'attending')).strip()
        diet = str(data.get('diet', 'Regular Gujarati')).strip()

        if not name:
            return JsonResponse({'error': 'Name is required'}, status=400)

        RSVP.objects.create(name=name, guests=guests, status=status, diet=diet)
        return JsonResponse({'success': True})

    elif request.method == 'GET':
        rsvps = RSVP.objects.all()[:200]
        data = [{
            'id': r.id,
            'name': r.name,
            'guests': r.guests,
            'status': r.status,
            'diet': r.diet,
            'time': r.created_at.strftime('%Y-%m-%d %H:%M')
        } for r in rsvps]
        return JsonResponse(data, safe=False)

    return JsonResponse({'error': 'Method not allowed'}, status=405)
