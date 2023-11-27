/*
 * Copyright (c) 2022 Software AG, Darmstadt, Germany and/or Software AG USA Inc., Reston, VA, USA,
 * and/or its subsidiaries and/or its affiliates and/or their licensors.
 *
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @authors Christof Strack
 */
import {
  Component,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  ActionControl,
  AlertService,
  BulkActionControl,
  Column,
  ColumnDataType,
  Pagination,
  gettext,
} from "@c8y/ngx-components";
import { AnalyticsService } from "../../shared/analytics.service";
import { CEP_Block } from "../../shared/analytics.model";
import { BsModalService } from "ngx-bootstrap/modal";
import { NameExtensionComponent } from "../../wizard/name-extension-modal.component";

@Component({
  selector: "c8y-sample-grid",
  templateUrl: "sample.component.html",
  styleUrls: ["./sample.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class SampleGridComponent implements OnInit {
  showConfigSample: boolean = false;
  refresh: EventEmitter<any> = new EventEmitter<any>();
  showMonitorEditor: boolean = false;
  samples: any[] = [];
  actionControls: ActionControl[] = [];
  bulkActionControls: BulkActionControl[] = [];
  source: string = "";

  titleSample: string = "AnalyticsBuilder Community Samples";

  columnsSamples: Column[] = [
    {
      name: "name",
      header: "Name",
      path: "name",
      dataType: ColumnDataType.TextLong,
      gridTrackSize: "15%",
      visible: true,
    },
    {
      name: "url",
      header: "URL",
      path: "url",
      dataType: ColumnDataType.TextLong,
      visible: true,
    },
  ];

  pagination: Pagination = {
    pageSize: 3,
    currentPage: 1,
  };

  constructor(
    public analyticsService: AnalyticsService,
    public alertService: AlertService,
    private bsModalService: BsModalService
  ) {}

  async ngOnInit() {
    await this.loadSamples();
    this.refresh.subscribe(() => {
      this.loadSamples();
    });

    this.bulkActionControls.push({
      type: "CREATE",
      text: "Create Extension",
      icon: "export",
      callback: this.createExtension.bind(this),
    });

    this.actionControls.push({
      text: "View Source",
      type: "VIEW",
      icon: "document-with-code",
      callback: this.viewMonitor.bind(this),
    });
  }

  async viewMonitor(block: CEP_Block) {
    try {
      this.source = await this.analyticsService.getBlock_Sample_Content(
        block.name
      );
    } catch (error) {
      console.log ("Something happended:",error);
    }
    this.showMonitorEditor = true;
  }

  public async createExtension(ids: string[]) {
    const initialState = {};
    const modalRef = this.bsModalService.show(NameExtensionComponent, {
      initialState,
    });
    modalRef.content.closeSubject.subscribe(async (conf) => {
      console.log("Configuration after edit:", conf);
      if (conf) {
        const response = await this.analyticsService.createExtensionsZIP(
          conf.name,
          ids
        );
        if (response) {
          this.alertService.success(
            gettext(`Created extension ${conf.name}.zip successfully‚`)
          );
        } else {
          this.alertService.danger(gettext("Failed to create extension"));
        }
      }
    });
  }

  async loadSamples() {
    this.samples = await this.analyticsService.getBlock_Samples();
  }

  ngOnDestroy() {}
}