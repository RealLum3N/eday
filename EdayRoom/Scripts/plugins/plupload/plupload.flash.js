(function(f, b, d, e) {
    var a = { }, g = { };

    function c() {
        var h;
        try {
            h = navigator.plugins["Shockwave Flash"];
            h = h.description;
        } catch(j) {
            try {
                h = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version");
            } catch(i) {
                h = "0.0";
            }
        }
        h = h.match( /\d+/g );
        return parseFloat(h[0] + "." + h[1]);
    }

    d.flash = {
        trigger: function(j, h, i) {
            setTimeout(function() {
                var m = a[j], l, k;
                if (m) {
                    m.trigger("Flash:" + h, i);
                }
            }, 0);
        }
    };
    d.runtimes.Flash = d.addRuntime("flash", {
        getFeatures: function() { return { jpgresize: true, pngresize: true, maxWidth: 8091, maxHeight: 8091, chunks: true, progress: true, multipart: true, multi_selection: true }; },
        init: function(m, o) {
            var k, l, h = 0, i = b.body;
            if (c() < 10) {
                o({ success: false });
                return;
            }
            g[m.id] = false;
            a[m.id] = m;
            k = b.getElementById(m.settings.browse_button);
            l = b.createElement("div");
            l.id = m.id + "_flash_container";
            d.extend(l.style, { position: "absolute", top: "0px", background: m.settings.shim_bgcolor || "transparent", zIndex: 99999, width: "100%", height: "100%" });
            l.className = "plupload flash";
            if (m.settings.container) {
                i = b.getElementById(m.settings.container);
                if (d.getStyle(i, "position") === "static") {
                    i.style.position = "relative";
                }
            }
            i.appendChild(l);
            (function() {
                var p, q;
                p = '<object id="' + m.id + '_flash" type="application/x-shockwave-flash" data="' + m.settings.flash_swf_url + '" ';
                if (d.ua.ie) {
                    p += 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" ';
                }
                p += 'width="100%" height="100%" style="outline:0"><param name="movie" value="' + m.settings.flash_swf_url + '" /><param name="flashvars" value="id=' + escape(m.id) + '" /><param name="wmode" value="transparent" /><param name="allowscriptaccess" value="always" /></object>';
                if (d.ua.ie) {
                    q = b.createElement("div");
                    l.appendChild(q);
                    q.outerHTML = p;
                    q = null;
                } else {
                    l.innerHTML = p;
                }
            }());

            function n() {
                return b.getElementById(m.id + "_flash");
            }

            function j() {
                if (h++ > 5000) {
                    o({ success: false });
                    return;
                }
                if (!g[m.id]) {
                    setTimeout(j, 1);
                }
            }

            j();
            k = l = null;
            m.bind("Flash:Init", function() {
                var q = { }, p;
                n().setFileFilters(m.settings.filters, m.settings.multi_selection);
                if (g[m.id]) {
                    return;
                }
                g[m.id] = true;
                m.bind("UploadFile", function(r, t) {
                    var u = r.settings, s = m.settings.resize || { };
                    n().uploadFile(q[t.id], u.url, { name: t.target_name || t.name, mime: d.mimeTypes[t.name.replace( /^.+\.([^.]+)/ , "$1").toLowerCase()] || "application/octet-stream", chunk_size: u.chunk_size, width: s.width, height: s.height, quality: s.quality, multipart: u.multipart, multipart_params: u.multipart_params || { }, file_data_name: u.file_data_name, format: /\.(jpg|jpeg)$/i .test(t.name) ? "jpg" : "png", headers: u.headers, urlstream_upload: u.urlstream_upload });
                });
                m.bind("Flash:UploadProcess", function(s, r) {
                    var t = s.getFile(q[r.id]);
                    if (t.status != d.FAILED) {
                        t.loaded = r.loaded;
                        t.size = r.size;
                        s.trigger("UploadProgress", t);
                    }
                });
                m.bind("Flash:UploadChunkComplete", function(r, t) {
                    var u, s = r.getFile(q[t.id]);
                    u = { chunk: t.chunk, chunks: t.chunks, response: t.text };
                    r.trigger("ChunkUploaded", s, u);
                    if (s.status != d.FAILED) {
                        n().uploadNextChunk();
                    }
                    if (t.chunk == t.chunks - 1) {
                        s.status = d.DONE;
                        r.trigger("FileUploaded", s, { response: t.text });
                    }
                });
                m.bind("Flash:SelectFiles", function(r, u) {
                    var t, s, v = [], w;
                    for (s = 0; s < u.length; s++) {
                        t = u[s];
                        w = d.guid();
                        q[w] = t.id;
                        q[t.id] = w;
                        v.push(new d.File(w, t.name, t.size));
                    }
                    if (v.length) {
                        m.trigger("FilesAdded", v);
                    }
                });
                m.bind("Flash:SecurityError", function(r, s) { m.trigger("Error", { code: d.SECURITY_ERROR, message: d.translate("Security error."), details: s.message, file: m.getFile(q[s.id]) }); });
                m.bind("Flash:GenericError", function(r, s) { m.trigger("Error", { code: d.GENERIC_ERROR, message: d.translate("Generic error."), details: s.message, file: m.getFile(q[s.id]) }); });
                m.bind("Flash:IOError", function(r, s) { m.trigger("Error", { code: d.IO_ERROR, message: d.translate("IO error."), details: s.message, file: m.getFile(q[s.id]) }); });
                m.bind("Flash:ImageError", function(r, s) { m.trigger("Error", { code: parseInt(s.code, 10), message: d.translate("Image error."), file: m.getFile(q[s.id]) }); });
                m.bind("Flash:StageEvent:rollOver", function(r) {
                    var s, t;
                    s = b.getElementById(m.settings.browse_button);
                    t = r.settings.browse_button_hover;
                    if (s && t) {
                        d.addClass(s, t);
                    }
                });
                m.bind("Flash:StageEvent:rollOut", function(r) {
                    var s, t;
                    s = b.getElementById(m.settings.browse_button);
                    t = r.settings.browse_button_hover;
                    if (s && t) {
                        d.removeClass(s, t);
                    }
                });
                m.bind("Flash:StageEvent:mouseDown", function(r) {
                    var s, t;
                    s = b.getElementById(m.settings.browse_button);
                    t = r.settings.browse_button_active;
                    if (s && t) {
                        d.addClass(s, t);
                        d.addEvent(b.body, "mouseup", function() { d.removeClass(s, t); }, r.id);
                    }
                });
                m.bind("Flash:StageEvent:mouseUp", function(r) {
                    var s, t;
                    s = b.getElementById(m.settings.browse_button);
                    t = r.settings.browse_button_active;
                    if (s && t) {
                        d.removeClass(s, t);
                    }
                });
                m.bind("Flash:ExifData", function(r, s) { m.trigger("ExifData", m.getFile(q[s.id]), s.data); });
                m.bind("Flash:GpsData", function(r, s) { m.trigger("GpsData", m.getFile(q[s.id]), s.data); });
                m.bind("QueueChanged", function(r) { m.refresh(); });
                m.bind("FilesRemoved", function(r, t) {
                    var s;
                    for (s = 0; s < t.length; s++) {
                        n().removeFile(q[t[s].id]);
                    }
                });
                m.bind("StateChanged", function(r) { m.refresh(); });
                m.bind("Refresh", function(r) {
                    var s, t, u;
                    n().setFileFilters(m.settings.filters, m.settings.multi_selection);
                    s = b.getElementById(r.settings.browse_button);
                    if (s) {
                        t = d.getPos(s, b.getElementById(r.settings.container));
                        u = d.getSize(s);
                        d.extend(b.getElementById(r.id + "_flash_container").style, { top: t.y + "px", left: t.x + "px", width: u.w + "px", height: u.h + "px" });
                    }
                });
                m.bind("Destroy", function(r) {
                    var s;
                    d.removeAllEvents(b.body, r.id);
                    delete g[r.id];
                    delete a[r.id];
                    s = b.getElementById(r.id + "_flash_container");
                    if (s) {
                        i.removeChild(s);
                    }
                });
                o({ success: true });
            });
        }
    });
})(window, document, plupload);