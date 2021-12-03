import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { CellClickedEvent } from 'ag-grid-community';
import { isObject } from 'lodash';
import { Title } from '@angular/platform-browser';

import { ListService } from 'src/app/services/list.service';

@Component({
  selector: 'app-list-details',
  templateUrl: './list-details.component.html',
  styleUrls: ['./list-details.component.css']
})
export class ListDetailsComponent implements OnInit {

  rowData = [];
  records = new FormControl();
  recordList: string[] = [];
  totalCount : number[] = [];
  recordDataTitles: string[] = [];
  showData: boolean = false;
  tableClicked: boolean = false;
  showform: boolean = false;
  state = "closed";
  title: string = '';
  error: boolean = false;
  tables: any[] = [];
  tablesTitles: any[] = [];
  tablesCount: number = 0;
  nonLitsInfo: any[] = [];
  keysNonList: any[] = [];
  TableName: string = '';
  errorMessage: string = '';
  keysList: any[] = [];
  recordTitlesWithId: any[] = [];
  
  gridApi: any;
  gridColumnApi: any;

  // private popupParent;
  // private rowData;

  constructor(
    private route: ActivatedRoute,
    private listservice : ListService,
    private router: Router,
    private titleService: Title
  ) { }

  columnDefs: any[] = [
  ];

  defaultColDef = {
    resizable: true,
  };

  ngOnInit(): void {
    const name = String(this.route.snapshot.paramMap.get('source'));
    this.listservice.getSourceList(name).subscribe(list =>{
      if(list){
        this.hideloader();
      }
      this.initList(list);
    },
    err => {
      if(err.status == 404) {
        this.hideloader();
        this.error = true;
        this.title = err.error;
        this.errorMessage ='The requested page: "/'+ String(this.route.snapshot.params.source) + '" could not be found.';
      }
   });
    this.listservice.getNameOfSource(name).subscribe(list => this.initTitle(list));
    this.listservice.getTitlesofSourceRecords(name).subscribe(list =>this.initRecordDropdown(list));
  }

  hideloader() {
    (<HTMLInputElement>document.getElementById('loading')).style.display = 'none';
  }

  initTitle(list: any): void {
    // console.log(list)
    this.title = String(list[0].name) + ' ('+list[0].count +' records)';
    this.titleService.setTitle('SeaLit - '+ this.title);
    
  }

  initRecordDropdown(list: any) {
    this.listservice.Titles = list.map((elem: any) => elem.title);
    // this.listservice.Ids = list.map((elem: any)=> elem.id);
    this.recordTitlesWithId = list;
    this.recordList = this.listservice.Titles.sort();
    this.showform = true;
  }

  initList(list: any): void {
    list.map((elem: any) => {
      this.recordDataTitles.push(elem.name);
      this.totalCount.push(elem.count);
    })
    this.showData = true;
  }


  gridOptions = {
    // Add event handlers
    onCellClicked: ((event: CellClickedEvent) =>{
        var source = String(this.route.snapshot.paramMap.get('source'));
        var data = event.data;
        var entity = this.TableName.replace('/','-');
        var name = ''
        Object.keys(data).forEach(k =>{
          if(typeof data[k] == 'string' && k!= 'value-type')
            name =data[k];
        });
        // console.log(data)

        for (const key in data) {
          if(isObject(data[key]) || key=='value-type' || key =='listLength')
              delete data[key];
        }
        // console.log(data)

        // console.log('list/'+source+'/Table?'+'Table='+entity+query);
        this.router.navigate(['list/'+source+'/Table/'+entity], { queryParams:data });
    })

  }

  displaytable(entity:string): void{
    const source = String(this.route.snapshot.paramMap.get('source'));

    if(entity !== this.TableName){
      this.listservice.getTableFromSource(source,entity).subscribe((table:any)=>{
        console.log(table);
        this.TableName = entity;
        this.columnDefs = this.formatTableTitles(table);
        this.rowData = table;
        if(!this.tableClicked){
          this.tableClicked = !this.tableClicked;
        }
      })
    }else{
      this.tableClicked = !this.tableClicked;
    }

  }

  formatTableTitles(table: any[]): any[]{

    var titles: any =  this.getTitles(table[0]);
    var titleFormat = titles.map((val: string) => {
        return {'field': val, 'sortable': true, 'filter': true, tooltipField: val};
    });

    // console.log(titleFormat);
    return titleFormat;
  }

  displaySelectedRecord(title:string): void {
    var record = this.recordTitlesWithId.filter(elem => elem.title === title);
    var id = record[0].id;
    const name = String(this.route.snapshot.paramMap.get('source'));
    this.router.navigate(['list/'+name+'/'+id]);
  }

  getTitles(temp: any): string[]{
    var titles: string[] = [];
    for (const [key, value] of Object.entries(temp)) {
      if(!isObject(value) && key!='value-type' && key!='listLength' && key!='listIds')
        titles.push(key);
    }
    return titles;
  }

  onBtnExport(tableg: any){
    // console.log(tableg);
    // console.log(this.listservice.ConvertToCSV(tableg))
    var blob = new Blob([this.listservice.ConvertToCSV(tableg)], {type: 'text/csv' });
    saveAs(blob, "export.csv");
  }

  

}

