let escapeHtml = Npm.require('escape-html'),
    bodyParser = Npm.require('body-parser');

Picker.middleware(bodyParser.json());

/**
 * Search Engine Optimization utility functions
 */
class _SeoUtils {

    /**
     * Get the HTML layout
     */
    static getLayout(){
        if (!this.layout || config.debug.isDebug) {
            this.layout = HTTP.call('GET', Meteor.absoluteUrl()).content;
        }
        return this.layout;
    }

    /**
     * Render a template
     *
     * @param {string} templateName
     * @param {object} params
     * @param {object} meta
     * @return {string}
     */
    static render(templateName, params, meta){
        this.templateCache || (this.templateCache = {});
        let templateKey = templateName.replace(/\//g, '_');
        if (!this.templateCache[templateKey]) {
            this.templateCache[templateKey] = SSR.compileTemplate(templateKey, Assets.getText('seo/' + templateName + '.html'));
            Template[templateKey].helpers({
                safeUrl: function(url){
                    return url ? url.replace('http:', 'https:') : url;
                },
                trimExt: function(url){
                    return url.replace(/\.[^.]+$/, '');
                }
            });
        }
        var html;
        if (typeof(params.layout) !== 'undefined'){
            if (params.layout === false){
                html = SSR.render(templateKey, params);
            } else {
                html = Assets.getText('seo/layouts/' + params.layout + '.html')
                    .replace('%%BASE_URL%%', Meteor.absoluteUrl())
                    .replace('<!-- CONTENT -->', SSR.render(templateKey, params));
            }
        } else {
            html = this.getLayout().replace('<!-- CONTENT -->', SSR.render(templateKey, params));
        }
        if (meta) {
            let metaHtml = '';
            let title = '';
            meta.forEach((metaItem) => {
                let metaItemHtml = '<meta';
                let isTitle = false;
                for (var metaKey in metaItem){
                    metaItemHtml += ' ' + metaKey + '="' + escapeHtml(metaItem[metaKey]) + '"';
                    if (metaItem[metaKey] === 'title' || metaItem[metaKey] === 'og:title'){
                        isTitle = true;
                    } else if (isTitle){
                        title = metaItem[metaKey];
                        isTitle = false;
                    }
                }
                metaHtml += metaItemHtml + '>\n';
            });
            if (title) {
                html = html.replace('<title>', '<title>' + escapeHtml(title) + ' - ');
            }
            html = html.replace(/<!-- META -->(.|\n)*<!-- \/META -->/, metaHtml);
        }

        if (params.bodyClass) {
            html = html.replace('<html', '<html class="'+params.bodyClass+'"');
        }

        return html;
    }

    /**
     * Define a route for SEO
     *
     * @param {string} pageUrl
     * @param {string} templateName     Template name is relative to /private/seo, without the ".html"
     * @param {function} process
     */
    static route(pageUrl, templateName, process){
        Picker.route(pageUrl, function(params, req, res, next) {
            let meta = [];
            let viewParams = process(params, meta);
            res.setHeader('Content-Type', 'text/html;charset=utf-8');
            res.end(SeoUtils.render(templateName, viewParams, meta));
        });
    }
}

// Export
SeoUtils = _SeoUtils;
