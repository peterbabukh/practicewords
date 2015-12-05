define(["backbone","app/WordModel","underscore.string","i18n!../../js/nls/ru","text!../../templates/newEntry.html","helpers/formToJSON","helpers/some"],function(a,b,c,d,e){"use strict";var f=a.View.extend({events:{"blur .enWord":"transferEnData","blur .ruWord":"transferRuData","click .submit-entry":"addNewEntry"},template:_.template(e),render:function(){return this.$el.append(this.template(d)),this},addNewEntry:function(a){a=a||window.event,a.preventDefault();var c=a.target||a.srcElement,e=$(c).closest("form");if(!this.validateForm(e))return void alert(d.alert.fillAllInputs);var f=e.serializeObject();if(!this.validateObject(f))return void alert(d.alert.suchModelExists);$(".res").empty(),e.find('input[type="text"]').not('[name="wordGroup"]').val("");var g=new b(f);this.collection.push(g),g.save({creator:"user"})},validateObject:function(a){var b=!0;return this.collection.each(function(d){(c.clean(a.enWord.toLowerCase())==c.clean(d.get("enWord").toLowerCase())||c.clean(a.ruWord.toLowerCase())==c.clean(d.get("ruWord").toLowerCase()))&&(b=!1)}),b===!0},validateForm:function(a){var b=$(a).find('input[type*="text"]').some(function(a){return c.isBlank($(a).val())});return b?!1:!0},transferEnData:function(){this.transferData(".enWord",'input[name="enSynonyms"]')},transferRuData:function(){this.transferData(".ruWord",'input[name="ruSynonyms"]')},transferData:function(a,b){var d=this.$el.find(a).val(),e=this.$el.find(b).val();if(!c.isBlank(d))if(c.isBlank(e))this.$el.find(b).val(d+", ");else{if(-1!=e.indexOf(d+","))return;this.$el.find(b).val(d+", "+e)}}});return f});