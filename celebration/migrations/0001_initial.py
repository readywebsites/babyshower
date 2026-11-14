from django.db import migrations, models

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PollVote',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice', models.CharField(choices=[('boy', 'Boy 🍼'), ('girl', 'Girl 🎀')], max_length=10)),
                ('voter_ip', models.GenericIPAddressField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Poll Vote',
                'verbose_name_plural': 'Poll Votes',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='RSVP',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('guests', models.PositiveIntegerField(default=1)),
                ('status', models.CharField(default='attending', max_length=50)),
                ('diet', models.CharField(default='Regular Gujarati', max_length=100)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'RSVP',
                'verbose_name_plural': 'RSVPs',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Wish',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=120)),
                ('message', models.TextField()),
                ('likes', models.PositiveIntegerField(default=1)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Guest Wish',
                'verbose_name_plural': 'Guest Wishes',
                'ordering': ['-created_at'],
            },
        ),
    ]
