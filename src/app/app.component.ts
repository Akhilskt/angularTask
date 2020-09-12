import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-task';
  pageResponse;
  constructor(private http: HttpClient){ 
    this.http.get('assets/pageResponse.json', { responseType: 'json' }).subscribe(data => {
      this.pageResponse = data;
    });
  }
}
