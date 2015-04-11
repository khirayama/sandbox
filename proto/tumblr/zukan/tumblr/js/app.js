;
var zukan = zukan || {};
(function() {
  'use strict';
  // Model //////////////////////////////////////////////////////////////////
  zukan.Article = Backbone.Model.extend({
    defaults: {
      title: '',
      body: '',
      link: '',
      pubDate: '',
      tags: [],
      schedule: '',
      done: ''
    }
  });
  // Collection /////////////////////////////////////////////////////////////
  zukan.Articles = Backbone.Collection.extend({
    model: zukan.Article,
    comparator: function(article) {
      return (article.get('schedule'))? article.get('schedule') : -article.get('pubDate');
    }
  });
  // View ///////////////////////////////////////////////////////////////////
  zukan.TopView = Backbone.View.extend({
    el: '.main',
    initialize: function() {
      this.createArticle();
      this.listenTo(zukan.topics, 'add', this.addOne);
      this.listenTo(zukan.topics, 'sort', this.addAll);

      this.listenTo(zukan.schedule, 'add', this.addOne);
      this.listenTo(zukan.schedule, 'sort', this.addAll);

      this.listenTo(zukan.discography, 'add', this.addOne);
      this.listenTo(zukan.discography, 'sort', this.addAll);

      zukan.topics.sort();
      zukan.schedule.sort();
      zukan.discography.sort();
    },
    addOne: function(article) {
      zukan.TopLi = new zukan.TopLiView({
        model: article
      });
      zukan.ShortLi = new zukan.ShortLiView({
        model: article
      });
      if(article.get('tags').indexOf('topics') != -1) $('.topics-list').append(zukan.TopLi.render().el);
      if(article.get('tags').indexOf('schedule') != -1) $('.schedule-list').append(zukan.ShortLi.render().el);
      if(article.get('tags').indexOf('discography') != -1) $('.discography-list').append(zukan.TopLi.render().el);
      if(article.get('tags').indexOf('live') != -1) $('.live-list').append(zukan.TopLi.render().el);
      if(article.get('tags').indexOf('media') != -1) $('.media-list').append(zukan.TopLi.render().el);
    },
    addAll: function() {
      this.$('.topics-list').html('');
      this.$('.schedule-list').html('');
      this.$('.discography-list').html('');
      this.$('.live-list').html('');
      this.$('.media-list').html('');
      zukan.topics.each(this.addOne, this);
      zukan.schedule.each(this.addOne, this);
      zukan.discography.each(this.addOne, this);
    },
    newAttributes: function(article) {
      return {
        title: article['title'],
        body: article['body'],
        link: article['link'],
        pubDate: article['pubDate'],
        tags: article['tags'],
        schedule: article['schedule'],
        done: article['done']
      };
    },
    createArticle: function() {
      for (var i = 0; i < topics.length; i++) {
        zukan.topics.add(this.newAttributes(topics[i]));
      }
      for (var i = 0; i < discography.length; i++) {
        zukan.discography.add(this.newAttributes(discography[i]));
      }
      for (var i = 0; i < schedule.length; i++) {
        zukan.schedule.add(this.newAttributes(schedule[i]));
      }
    }
  });
  zukan.TopLiView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#top-template').html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      if(this.model.get('done')) this.$el.addClass('done');
      return this;
    }
  });
  zukan.ShortLiView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#short-template').html()),
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      if(this.model.get('done')) this.$el.addClass('done');
      return this;
    }
  });
  zukan.ZukanView = Backbone.View.extend({
    el: '#zukan',
    initialize: function() {
      zukan.Top = new zukan.TopView();
    },
  });
})($);

// App ///////////////////////////////////////////////////////////////////////
$(function() {
  'use strict';
  for(var i = 0; i < articles.length; i++) {
    if(articles[i].tags.indexOf('topics') != -1) topics[topics.length] = articles[i];
    if(articles[i].tags.indexOf('schedule') != -1) schedule[schedule.length] = articles[i];
    if(articles[i].tags.indexOf('discography') != -1) discography[discography.length] = articles[i];
  }
  for(var i = 0; i < schedule.length; i++) {
    for(var j = 0; j < schedule[i].tags.length; j++) {
      if(schedule[i].tags[j].indexOf('/') != -1) {
        var date = new Date(schedule[i].tags[j]);
        var today = new Date();
        // today.setDate(today.getDate());
        today.setDate(today.getDate() - 1);
        schedule[i].schedule = date;
        schedule[i].done = (today > date) ? true : false;
      }
    }
  }
  zukan.topics = new zukan.Articles();
  zukan.discography = new zukan.Articles();
  zukan.schedule = new zukan.Articles();
  zukan.App = new zukan.ZukanView();
  $('.done').remove();
  if (!$('.topics-list>li').length) {
    $('.main .topics').remove();
  };
  if (!$('.schedule-list>li').length) {
    $('.main .schedule').remove();
  };
  if (!$('.live-list>li').length) {
    $('.main .live').remove();
  };
  if (!$('.media-list>li').length) {
    $('.main .media').remove();
  };
  if (!$('.hot>a').length) {
    $('.main .hot').remove();
  };
});

















