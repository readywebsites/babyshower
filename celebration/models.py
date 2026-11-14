from django.db import models

class PollVote(models.Model):
    CHOICES = (
        ('boy', 'Boy 🍼'),
        ('girl', 'Girl 🎀'),
    )
    choice = models.CharField(max_length=10, choices=CHOICES)
    voter_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Poll Vote'
        verbose_name_plural = 'Poll Votes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.choice.upper()} from {self.voter_ip or 'unknown'}"


class Wish(models.Model):
    name = models.CharField(max_length=120)
    message = models.TextField()
    likes = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Guest Wish'
        verbose_name_plural = 'Guest Wishes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name}: {self.message[:40]}"


class RSVP(models.Model):
    name = models.CharField(max_length=150)
    guests = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=50, default='attending')
    diet = models.CharField(max_length=100, default='Regular Gujarati')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'RSVP'
        verbose_name_plural = 'RSVPs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.guests} guests) - {self.status}"
