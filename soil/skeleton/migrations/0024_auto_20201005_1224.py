# Generated by Django 3.0.6 on 2020-10-04 23:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skeleton', '0023_auto_20200922_1146'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='sitedescription',
            options={'ordering': ['site_number']},
        ),
        migrations.AddField(
            model_name='site',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
