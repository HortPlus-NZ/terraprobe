# Generated by Django 3.0.6 on 2021-05-10 20:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('address', '0002_auto_20160213_1726'),
        ('skeleton', '0026_weatherstation_average_rainfall'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='etreading',
            unique_together={('date', 'state')},
        ),
    ]
