(function(a) {
    a.runtimes.BrowserPlus = a.addRuntime("browserplus", {
        getFeatures: function() { return { dragdrop: true, jpgresize: true, pngresize: true, chunks: true, progress: true, multipart: true, multi_selection: true }; },
        init: function(g, i) {
            var e = window.BrowserPlus, h = { }, d = g.settings, c = d.resize;

            function f(n) {
                var m, l, j = [], k, o;
                for (l = 0; l < n.length; l++) {
                    k = n[l];
                    o = a.guid();
                    h[o] = k;
                    j.push(new a.File(o, k.name, k.size));
                }
                if (l) {
                    g.trigger("FilesAdded", j);
                }
            }

            function b() {
                g.bind("PostInit", function() {
                    var m, k = d.drop_element, o = g.id + "_droptarget", j = document.getElementById(k), l;

                    function p(r, q) {
                        e.DragAndDrop.AddDropTarget({ id: r }, function(s) {
                            e.DragAndDrop.AttachCallbacks({
                                    id: r,
                                    hover: function(t) {
                                        if (!t && q) {
                                            q();
                                        }
                                    },
                                    drop: function(t) {
                                        if (q) {
                                            q();
                                        }
                                        f(t);
                                    }
                                }, function() {
                                });
                        });
                    }

                    function n() {
                        document.getElementById(o).style.top = "-1000px";
                    }

                    if (j) {
                        if (document.attachEvent && ( /MSIE/gi ).test(navigator.userAgent)) {
                            m = document.createElement("div");
                            m.setAttribute("id", o);
                            a.extend(m.style, { position: "absolute", top: "-1000px", background: "red", filter: "alpha(opacity=0)", opacity: 0 });
                            document.body.appendChild(m);
                            a.addEvent(j, "dragenter", function(r) {
                                var q, s;
                                q = document.getElementById(k);
                                s = a.getPos(q);
                                a.extend(document.getElementById(o).style, { top: s.y + "px", left: s.x + "px", width: q.offsetWidth + "px", height: q.offsetHeight + "px" });
                            });
                            p(o, n);
                        } else {
                            p(k);
                        }
                    }
                    a.addEvent(document.getElementById(d.browse_button), "click", function(v) {
                        var t = [], r, q, u = d.filters, s;
                        v.preventDefault();
                        no_type_restriction:for (r = 0; r < u.length; r++) {
                                                s = u[r].extensions.split(",");
                                                for (q = 0; q < s.length; q++) {
                                                    if (s[q] === "*") {
                                                        t = [];
                                                        break no_type_restriction;
                                                    }
                                                    t.push(a.mimeTypes[s[q]]);
                                                }
                                            }
                        e.FileBrowse.OpenBrowseDialog({ mimeTypes: t }, function(w) {
                            if (w.success) {
                                f(w.value);
                            }
                        });
                    });
                    j = m = null;
                });
                g.bind("UploadFile", function(m, j) {
                    var l = h[j.id], r = { }, k = m.settings.chunk_size, n, o = [];

                    function q(s, u) {
                        var t;
                        if (j.status == a.FAILED) {
                            return;
                        }
                        r.name = j.target_name || j.name;
                        if (k) {
                            r.chunk = "" + s;
                            r.chunks = "" + u;
                        }
                        t = o.shift();
                        e.Uploader.upload({
                                url: m.settings.url,
                                files: { file: t },
                                cookies: document.cookies,
                                postvars: a.extend(r, m.settings.multipart_params),
                                progressCallback: function(x) {
                                    var w, v = 0;
                                    n[s] = parseInt(x.filePercent * t.size / 100, 10);
                                    for (w = 0; w < n.length; w++) {
                                        v += n[w];
                                    }
                                    j.loaded = v;
                                    m.trigger("UploadProgress", j);
                                }
                            }, function(w) {
                                var v, x;
                                if (w.success) {
                                    v = w.value.statusCode;
                                    if (k) {
                                        m.trigger("ChunkUploaded", j, { chunk: s, chunks: u, response: w.value.body, status: v });
                                    }
                                    if (o.length > 0) {
                                        q(++s, u);
                                    } else {
                                        j.status = a.DONE;
                                        m.trigger("FileUploaded", j, { response: w.value.body, status: v });
                                        if (v >= 400) {
                                            m.trigger("Error", { code: a.HTTP_ERROR, message: a.translate("HTTP Error."), file: j, status: v });
                                        }
                                    }
                                } else {
                                    m.trigger("Error", { code: a.GENERIC_ERROR, message: a.translate("Generic Error."), file: j, details: w.error });
                                }
                            });
                    }

                    function p(s) {
                        j.size = s.size;
                        if (k) {
                            e.FileAccess.chunk({ file: s, chunkSize: k }, function(v) {
                                if (v.success) {
                                    var w = v.value, t = w.length;
                                    n = Array(t);
                                    for (var u = 0; u < t; u++) {
                                        n[u] = 0;
                                        o.push(w[u]);
                                    }
                                    q(0, t);
                                }
                            });
                        } else {
                            n = Array(1);
                            o.push(s);
                            q(0, 1);
                        }
                    }

                    if (c && /\.(png|jpg|jpeg)$/i .test(j.name)) {
                        BrowserPlus.ImageAlter.transform({ file: l, quality: c.quality || 90, actions: [{ scale: { maxwidth: c.width, maxheight: c.height } }] }, function(s) {
                            if (s.success) {
                                p(s.value.file);
                            }
                        });
                    } else {
                        p(l);
                    }
                });
                i({ success: true });
            }

            if (e) {
                e.init(function(k) {
                    var j = [{ service: "Uploader", version: "3" }, { service: "DragAndDrop", version: "1" }, { service: "FileBrowse", version: "1" }, { service: "FileAccess", version: "2" }];
                    if (c) {
                        j.push({ service: "ImageAlter", version: "4" });
                    }
                    if (k.success) {
                        e.require({ services: j }, function(l) {
                            if (l.success) {
                                b();
                            } else {
                                i();
                            }
                        });
                    } else {
                        i();
                    }
                });
            } else {
                i();
            }
        }
    });
})(plupload);