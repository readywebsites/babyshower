from django.contrib import admin
from .models import PollVote, Wish, RSVP

@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'choice', 'voter_ip', 'created_at')
    list_filter = ('choice', 'created_at')
    ordering = ('-created_at',)

@admin.register(Wish)
class WishAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'message_snippet', 'likes', 'created_at')
    search_fields = ('name', 'message')
    list_filter = ('created_at',)

    def message_snippet(self, obj):
        return obj.message[:60] + ('...' if len(obj.message) > 60 else '')
    message_snippet.short_description = 'Message'

@admin.register(RSVP)
class RSVPAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'guests', 'status', 'diet', 'created_at')
    list_filter = ('status', 'diet', 'created_at')
    search_fields = ('name',)
