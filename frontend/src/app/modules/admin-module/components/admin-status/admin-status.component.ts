import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AdminService} from '../../services/admin.service';

// the backup runs once a week, see the cloud function scheduledFirestoreExport
const MAX_BACKUP_AGE_IN_DAYS = 8;

interface Status {
  users: number;
  lastBackup: Date | undefined;
  backupOutdated: boolean;
  removedExports: number;
  removedExportsLastWeek: number;
  openFeedback: number;
  uncategorised: number;
  corrections: number;
}

@Component({
  standalone: false,
  selector: 'app-admin-status',
  templateUrl: './admin-status.component.html',
  styleUrls: ['./admin-status.component.sass']
})
export class AdminStatusComponent implements OnInit {

  public status: Observable<Status>;

  constructor(private admin: AdminService) {
  }

  ngOnInit(): void {

    this.status = combineLatest([
      this.admin.getStatistics(),
      this.admin.countOpenFeedbackMessages(),
      this.admin.getFoodCategories()
    ]).pipe(map(([statistics, openFeedback, food]) => {

      const lastBackup = statistics.last_backup_created?.toDate();
      const backupAge = lastBackup === undefined ? Infinity : (Date.now() - lastBackup.getTime()) / 86_400_000;

      return {
        users: statistics.user_count ?? 0,
        lastBackup,
        backupOutdated: backupAge > MAX_BACKUP_AGE_IN_DAYS,
        removedExports: statistics.removed_old_exports ?? 0,
        removedExportsLastWeek: statistics.old_week?.removed_old_exports ?? 0,
        openFeedback,
        uncategorised: food.uncategorised.length,
        corrections: food.resentCorrections.length
      };

    }));

  }

}
