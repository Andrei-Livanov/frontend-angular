import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.css']
})
export class InfoPageComponent implements OnInit {

  msg: string;
  isMobile: boolean;

  constructor(private route: ActivatedRoute, private deviceService: DeviceDetectorService) {
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    this.route.params.subscribe(params => {
      this.msg = params.msg;
    });
  }
}
