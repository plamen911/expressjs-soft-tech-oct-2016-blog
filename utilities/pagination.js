/* globals require, module */
'use strict'

const pagination = require('pagination')

module.exports = (req, data) => {
    let boostrapPaginator = new pagination.TemplatePaginator({
        prelink: '/',
        current: data.page,
        rowsPerPage: data.limit,
        totalResult: data.total,
        slashSeparator: false,
        template: (result) => {
            result.prelink = req.originalUrl

            if (req.query) {
                let qs = []
                for (let key in req.query) {
                    if (key === 'page') continue
                    qs.push(key + '=' + encodeURIComponent(req.query[key]))
                }
                result.prelink = '?' + qs.join('&')
            }

            let i
            let len
            let prelink
            let html = '<ul class="pagination">'
            if (typeof result.pageCount === 'undefined' || result.pageCount < 2) {
                html += '</ul>'
                return html
            }
            prelink = boostrapPaginator.preparePreLink(result.prelink)
            if (result.previous) {
                html += '<li class="prev"><a href="' + prelink + result.previous + '">&larr; ' +
                    boostrapPaginator.options.translator('PREVIOUS') + '</a></li>'
            } else {
                html += '<li class="prev disabled"><a href="javascript: void(0);">&larr; ' +
                    boostrapPaginator.options.translator('PREVIOUS') + '</a></li>'
            }
            if (result.range.length) {
                for (i = 0, len = result.range.length; i < len; i++) {
                    if (result.range[i] === result.current) {
                        html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>'
                    } else {
                        html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>'
                    }
                }
            }
            if (result.next) {
                html += '<li class="next"><a href="' + prelink + result.next + '">' +
                    boostrapPaginator.options.translator('NEXT') + ' &rarr;</a></li>'
            } else {
                html += '<li class="next disabled"><a href="javascript: void(0);">' +
                    boostrapPaginator.options.translator('NEXT') + ' &rarr;</a></li>'
            }
            html += '</ul>'
            return html
        }
    })

    let total = data.total
    let from = (data.page * data.limit - parseInt(data.limit)) + 1
    let to = data.page * data.limit
    if (to > total) {
        to = total
    }

    return {
        data: data.docs,
        links: boostrapPaginator.render(),
        from: from,
        to: to,
        current: data.page,
        limit: data.limit,
        pages: data.pages,
        total: total
    }
}

