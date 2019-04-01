// Dom7
var $$ = Dom7;

var now = new Date();
var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
var weekLater = new Date().setDate(today.getDate() + 7);
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


// Framework7 App main instance
var app = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.testapp', // App bundle ID
  name: 'Framework7', // App name
  theme: 'auto', // Automatic theme detection
  swipeout: {
    noFollow: true,
    removeElements: true,
  },
  // App root data
  data: function () {
    return {
      items: [],
      events: [],
      current: new Date(),
      list: null,
      calenda: null,
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
    loadADate: function (d) {
      // Show Preloader
      app.preloader.show();

      // User ID from request
      var date = d;
      var dateName = "";
      if (!date) {
        date = app.data.current || new Date();
        dateName = "Simple Note"
      }
      var key = dateKey(date);
      if (dateName.length == 0) {
        dateName = key;
      }
      selectLSM("DATA", { KEY: key }, "KEY", function (rs) {
        app.preloader.hide();
        app.data.items = rs;
        try {
          app.data.list.replaceAllItems(rs);
        } catch (er) { }
        $$(".virtual-list ul").css("height", "auto");
      });
    },
    updateCalenda: function () {
      app.data.calenda.params.events = app.data.events;
      app.data.calenda.update();
    },
    addEvent: function (date, color) {
      var cdate = date;
      if (cdate.getTime) {

      } else {
        cdate = new Date(cdate);
      }
      var f = app.data.events.filter(function (y) {
        return y.color == color && y.date == cdate;
      });
      if (f.length == 0) {
        app.data.events.push({ date: cdate, color: color });
      }
    }
  },
  // App routes
  routes: routes,
});

// Init/Create main view
var mainView = app.views.create('.view-main', {
  url: '/'
});

app.data.calenda = app.calendar.create({
  containerEl: '#demo-calendar-inline-container',
  value: [app.data.current],
  weekHeader: false,
  renderToolbar: function () {
    return '<div class="toolbar calendar-custom-toolbar no-shadow">' +
      '<div class="toolbar-inner">' +
      '<div class="left">' +
      '<a href="#" class="link icon-only"><i class="icon icon-back ' + (app.theme === 'md' ? 'color-lime' : '') + '"></i></a>' +
      '</div>' +
      '<div class="center"></div>' +
      '<div class="right">' +
      '<a href="#" class="link icon-only"><i class="icon icon-forward ' + (app.theme === 'md' ? 'color-lime' : '') + '"></i></a>' +
      '</div>' +
      '</div>' +
      '</div>';
  },
  events: app.data.events,
  on: {
    init: function (c) {
      $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] + ', ' + c.currentYear);
      $$('.calendar-custom-toolbar .left .link').on('click', function () {
        app.data.calenda.prevMonth();
      });
      $$('.calendar-custom-toolbar .right .link').on('click', function () {
        app.data.calenda.nextMonth();
      });
    },
    monthYearChangeStart: function (c) {
      $$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] + ', ' + c.currentYear);
    },
    dayClick: function (calendar, dayEl, year, month, day) {
      //app.panel.close("left",true);
      var date = new Date(year, month, day, 7,0,0);
      //date = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
      app.data.current = date;
      app.methods.loadADate(date);
    }
  }
});

$$(document).on('deviceready', function () {
  console.log("Device is ready!");
  //
  var date = new Date();
  app.data.current = date;
  var key = dateKey(date);

  //
  app.methods.loadADate(date);
  //
  app.data.list = app.virtualList.create({
    // List Element
    el: '.virtual-list',
    // Pass array with items
    items: app.data.items,
    // Custom search function for searchbar
    searchAll: function (query, items) {
      var found = [];
      for (var i = 0; i < items.length; i++) {
        if (items[i].title.toLowerCase().indexOf(query.toLowerCase()) >= 0 || query.trim() === '') found.push(i);
      }
      return found; //return array with mathced indexes
    },
    emptyTemplate: '<li style="min-height:64px; text-align:center;"><br>No data, please add new note...<br><br></li>',
    // List item Template7 template
    itemTemplate:
      '<li class="swipeout deleted-callback" data-id="{{ID}}">' +
      '<div class="swipeout-content "  data-id="{{ID}}">' +
      '<a href="/note/{{ID}}/" class="item-link item-content">' +
      '<div class="item-inner search-avaliable">' +
      '<div class="item-title-row">' +
      '<div class="item-title">Store: {{STORE}}</div>' +
      '<div class="item-after">{{DATE}} <i class="icon f7-icons" style="color:{{COLOR}}">bookmark_fill</i></div>' +
      '</div>' +
      '<div class="item-subtitle">Vendor: {{VENDOR}}, Truck: {{TRUCK}}<br>Driver: {{DRIVER}}, Phone: {{PHONE}}</div>' +
      '<div class="item-text resizable">' +
      '{{NOTE}}' +
      '</div>' +
      '</div>' +
      '</a>' +
      '</div>' +
      '<div class="swipeout-actions-left">' +
      '<a href="#" class="swipeout-overswipe copy-single" data-id="{{ID}}"><i class="icon f7-icons  ios-only">attachment</i><i class="icon material-icons md-only">attach_file</i></a>' +
      '</div>' +
      '<div class="swipeout-actions-right"  data-id="{{ID}}">' +
      '<a data-id="{{ID}}" href="#" data-confirm="Are you sure you want to delete this item?" ' +
      ' class="swipeout-delete delete-note"><i class="icon f7-icons  ios-only">trash</i><i class="icon material-icons md-only">delete</i></a>' +
      '</div>' +
      '</li>',
    // Item height
    height: app.theme === 'ios' ? 63 : (app.theme === 'md' ? 73 : 46),
    on: {
      itemsAfterInsert: function (virtualList, fragment) {
        $$(".virtual-list ul").css("height", "auto");
      }
    }
  });
  $$(".virtual-list ul").css("height", "auto");
  //$$(".virtual-list ul").css("height", "auto");
  loadLSM("DATA", function (rs) {
    app.data.events = [];
    var data = rs.map(function (x) {
      app.methods.addEvent(x.DATE, x.COLOR);
    });
    //app.data.events.push({date:new Date(2019,03,28), color:"#cccccc"});  
    app.methods.updateCalenda();
  });

  $$(".copy-all").on("click", function () {
    var key = dateKey(app.data.current);
    var g = key.split('').reverse().join('').replace(/[-]/g,"/");
    selectLSM("DATA", { KEY: key }, "KEY", function (rs) {
      var str = "Date: "+g+"\n";
      for (var i = 0; i < rs.length; i++) {
        var t = rs[i];
        str += "\n";
        str += "Store: "+t.STORE+"\n";
        str += "Vendor: "+t.VENDOR+"\n";
        str += "Truck: "+t.TRUCK+"\n";
        str += "Driver: "+t.DRIVER+"\n";
        str += "PHONE: "+t.PHONE+"\n";
        if(t.NOTE.length>0){
          str += "Note: "+t.NOTE+"\n";
        }
        str += "\n";
        // str = str + `
        // Store: ${t.STORE},\t Date: ${t.KEY}
        // ${t.VENDOR}\t${t.TRUCK}\t${t.DRIVER}\t${t.PHONE}
        // ${t.NOTE}
        
        // `;
      }
      if (str.length > 10) {
        cordova.plugins.clipboard.copy(str,function(){
          app.toast.create({
            text: 'Copied!',
            closeTimeout: 2000,
          }).open();
        },function(err){
          console.log(err);
        });
        //cordova.plugins.clipboard.paste(function (text) { alert(text); });
        
      } else {
        app.toast.create({
          text: 'Nothing to copy...',
          closeTimeout: 2000,
        }).open();
      }
    });
  });
  $$(".copy-single").on("click", function () {
    var id = $$(this).data("id");
    selectLSM("DATA", { ID: id }, "ID", function (rs) {
      var str = "";//"Date: "+g+"\n";
      for (var i = 0; i < rs.length; i++) {
        var t = rs[i];
        str += "\n";
        str += "Store: "+t.STORE+"\n";
        str += "Vendor: "+t.VENDOR+"\n";
        str += "Truck: "+t.TRUCK+"\n";
        str += "Driver: "+t.DRIVER+"\n";
        str += "PHONE: "+t.PHONE+"\n";
        if(t.NOTE.length>0){
          str += "Note: "+t.NOTE+"\n";
        }
        str += "\n";
        // str = str + `
        // Store: ${t.STORE},\t Date: ${t.KEY}
        // ${t.VENDOR}\t${t.TRUCK}\t${t.DRIVER}\t${t.PHONE}
        // ${t.NOTE}
        
        // `;
      }

    });
  });
  $$(".delete-note").on("click", function () {
    var id = $$(this).data("id");
    app.toast.create({
      text: id,
      closeTimeout: 2000,
    }).open();
    deleteLSM("DATA", { ID: id }, "ID");    
  });
  $$('.deleted-callback').on('swipeout:deleted', function () {
    var id = $$(this).data("id");
    app.toast.create({
      text: id,
      closeTimeout: 2000,
    }).open();
    deleteLSM("DATA", { ID: id }, "ID");    
  });
});
