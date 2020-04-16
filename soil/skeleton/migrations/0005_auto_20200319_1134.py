# Generated by Django 2.2.1 on 2020-03-18 22:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('skeleton', '0004_auto_20200314_1328'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='site',
            name='rz1_top',
        ),
        migrations.RemoveField(
            model_name='site',
            name='rz2_top',
        ),
        migrations.RemoveField(
            model_name='site',
            name='rz3_top',
        ),
        migrations.AlterField(
            model_name='calibration',
            name='soil_type',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=1, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth1',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth10',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth2',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth3',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth4',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth5',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth6',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth7',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth8',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth9',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he1',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=1, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he10',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=10, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he2',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=2, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he3',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=3, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he4',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=4, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he5',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=5, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he6',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=6, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he7',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=7, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he8',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=8, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='depth_he9',
            field=models.IntegerField(blank=True, choices=[(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10)], default=9, null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='rz1_bottom',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, help_text='The Bottom Depth of Root Zone 1. The Top will aways be zero.', null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='rz2_bottom',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, help_text='The Bottom Depth of Root Zone 2. The Top will aways be zero.', null=True),
        ),
        migrations.AlterField(
            model_name='site',
            name='rz3_bottom',
            field=models.IntegerField(blank=True, choices=[(0, 0), (10, 10), (20, 20), (30, 30), (40, 40), (50, 50), (60, 60), (70, 70), (80, 80), (90, 90), (100, 100), (110, 110), (120, 120)], default=0, help_text='The Bottom Depth of Root Zone 3. The Top will aways be zero.', null=True),
        ),
    ]