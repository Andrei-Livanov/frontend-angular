import {Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {DashboardData} from '../../../object/DashboardData';

@Component({
  selector: 'app-stat',
  templateUrl: './stat.component.html',
  styleUrls: ['./stat.component.css'],
  animations: [
    trigger('statRegion', [
      state('show', style({
        overflow: 'hidden',
        height: '*',
        opacity: '10'
      })),
      state('hide', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px'
      })),
      transition('* => *', animate('300ms ease-in-out'))
    ])
  ]
})
export class StatComponent implements OnInit {

  @Input()
  dash: DashboardData;

  @Input('showStat')
  set setShowStat(show: boolean) {
    this.showStatistics = show;
    this.initStatDash();
  }

  showStatistics: boolean;
  animationState: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  getTotal(): number {
    if (this.dash) {
      return this.dash.completedTotal + this.dash.uncompletedTotal;
    }
  }

  getCompletedCount(): number {
    if (this.dash) {
      return this.dash.completedTotal;
    }
  }

  getUncompletedCount(): number {
    if (this.dash) {
      return this.dash.uncompletedTotal;
    }
  }

  getCompletedPercent(): number {
    if (this.dash) {
      return this.dash.completedTotal ? (this.dash.completedTotal / this.getTotal()) : 0;
    }
  }

  getUncompletedPercent(): number {
    if (this.dash) {
      return this.dash.uncompletedTotal ? (this.dash.uncompletedTotal / this.getTotal()) : 0;
    }
  }

  initStatDash(): void {
    if (this.showStatistics) {
      this.animationState = 'show';
    } else {
      this.animationState = 'hide';
    }
  }
}
