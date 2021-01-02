
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src\Header.svelte generated by Svelte v3.31.1 */

    const { console: console_1 } = globals;
    const file = "src\\Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (17:4) {#each titleWords as w}
    function create_each_block_1(ctx) {
    	let t0_value = /*w*/ ctx[8].charAt(0) + "";
    	let t0;
    	let span;
    	let t1_value = /*w*/ ctx[8].substring(1) + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			span = element("span");
    			t1 = text(t1_value);
    			t2 = text("  ");
    			attr_dev(span, "class", "non-capital svelte-1ee8oif");
    			add_location(span, file, 17, 17, 438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t1);
    			append_dev(span, t2);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(17:4) {#each titleWords as w}",
    		ctx
    	});

    	return block;
    }

    // (23:4) {#each capitals as c}
    function create_each_block(ctx) {
    	let h1;
    	let t0_value = /*c*/ ctx[5].c + "";
    	let t0;
    	let t1;
    	let h1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = text("  ");
    			attr_dev(h1, "class", "svelte-1ee8oif");
    			add_location(h1, file, 23, 4, 574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*c*/ ctx[5].x, duration: 2000 }, true);
    				h1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*c*/ ctx[5].x, duration: 2000 }, false);
    			h1_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_transition) h1_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(23:4) {#each capitals as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let h1;
    	let t;
    	let div;
    	let current;
    	let each_value_1 = /*titleWords*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*capitals*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "full-text svelte-1ee8oif");
    			add_location(h1, file, 15, 0, 368);
    			attr_dev(div, "class", "brief-text svelte-1ee8oif");
    			add_location(div, file, 21, 0, 517);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(h1, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*titleWords*/ 1) {
    				each_value_1 = /*titleWords*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(h1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*capitals*/ 2) {
    				each_value = /*capitals*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { fullTitle } = $$props;
    	let { shortTitle } = $$props;
    	let titleWords = fullTitle.split(" ");
    	let titleChars = shortTitle.split("");
    	let capitals = [];

    	titleChars.forEach((item, index) => {
    		capitals.push({ c: item, x: (index + 1) * -100 });
    	});

    	console.log(titleChars);
    	const writable_props = ["fullTitle", "shortTitle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fullTitle" in $$props) $$invalidate(2, fullTitle = $$props.fullTitle);
    		if ("shortTitle" in $$props) $$invalidate(3, shortTitle = $$props.shortTitle);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		fullTitle,
    		shortTitle,
    		titleWords,
    		titleChars,
    		capitals
    	});

    	$$self.$inject_state = $$props => {
    		if ("fullTitle" in $$props) $$invalidate(2, fullTitle = $$props.fullTitle);
    		if ("shortTitle" in $$props) $$invalidate(3, shortTitle = $$props.shortTitle);
    		if ("titleWords" in $$props) $$invalidate(0, titleWords = $$props.titleWords);
    		if ("titleChars" in $$props) titleChars = $$props.titleChars;
    		if ("capitals" in $$props) $$invalidate(1, capitals = $$props.capitals);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [titleWords, capitals, fullTitle, shortTitle];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { fullTitle: 2, shortTitle: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fullTitle*/ ctx[2] === undefined && !("fullTitle" in props)) {
    			console_1.warn("<Header> was created without expected prop 'fullTitle'");
    		}

    		if (/*shortTitle*/ ctx[3] === undefined && !("shortTitle" in props)) {
    			console_1.warn("<Header> was created without expected prop 'shortTitle'");
    		}
    	}

    	get fullTitle() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fullTitle(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shortTitle() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shortTitle(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.31.1 */

    const file$1 = "src\\Footer.svelte";

    function create_fragment$1(ctx) {
    	let hr;
    	let t0;
    	let p;
    	let t1;
    	let t2;
    	let t3;
    	let i;
    	let t4;
    	let t5;
    	let span;
    	let t6;
    	let t7;
    	let a;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			p = element("p");
    			t1 = text("Copyright ");
    			t2 = text(/*year*/ ctx[0]);
    			t3 = text(" by ");
    			i = element("i");
    			t4 = text(/*author*/ ctx[1]);
    			t5 = text(", prepared for ");
    			span = element("span");
    			t6 = text(/*owner*/ ctx[2]);
    			t7 = text(" using ");
    			a = element("a");
    			a.textContent = "Svelte";
    			attr_dev(hr, "class", "svelte-ex8ezg");
    			add_location(hr, file$1, 6, 0, 101);
    			add_location(i, file$1, 7, 23, 130);
    			attr_dev(span, "class", "svelte-ex8ezg");
    			add_location(span, file$1, 7, 53, 160);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file$1, 7, 80, 187);
    			add_location(p, file$1, 7, 0, 107);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t1);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, i);
    			append_dev(i, t4);
    			append_dev(p, t5);
    			append_dev(p, span);
    			append_dev(span, t6);
    			append_dev(p, t7);
    			append_dev(p, a);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*year*/ 1) set_data_dev(t2, /*year*/ ctx[0]);
    			if (dirty & /*author*/ 2) set_data_dev(t4, /*author*/ ctx[1]);
    			if (dirty & /*owner*/ 4) set_data_dev(t6, /*owner*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Footer", slots, []);
    	let { year = "2021" } = $$props;
    	let { author } = $$props;
    	let { owner } = $$props;
    	const writable_props = ["year", "author", "owner"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("year" in $$props) $$invalidate(0, year = $$props.year);
    		if ("author" in $$props) $$invalidate(1, author = $$props.author);
    		if ("owner" in $$props) $$invalidate(2, owner = $$props.owner);
    	};

    	$$self.$capture_state = () => ({ year, author, owner });

    	$$self.$inject_state = $$props => {
    		if ("year" in $$props) $$invalidate(0, year = $$props.year);
    		if ("author" in $$props) $$invalidate(1, author = $$props.author);
    		if ("owner" in $$props) $$invalidate(2, owner = $$props.owner);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [year, author, owner];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { year: 0, author: 1, owner: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*author*/ ctx[1] === undefined && !("author" in props)) {
    			console.warn("<Footer> was created without expected prop 'author'");
    		}

    		if (/*owner*/ ctx[2] === undefined && !("owner" in props)) {
    			console.warn("<Footer> was created without expected prop 'owner'");
    		}
    	}

    	get year() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set year(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get author() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set author(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get owner() {
    		throw new Error("<Footer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set owner(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var data=[{_id:"5f3a3c5faa55d5c4ea549ac1",picture:"http://placehold.it/64x64",age:38,name:"Padilla Adkins",team:"EURON",races:[{name:"Race 0",time:"1:11:39.515"},{name:"Race 1",time:"1:17:24.312"},{name:"Race 2",time:"1:22:29.376"},{name:"Race 3",time:"1:10:34.491"},{name:"Race 4",time:"1:51:45.103"},{name:"Race 5",time:"1:44:16.158"},{name:"Race 6",time:"1:30:14.658"},{name:"Race 7",time:"1:29:41.505"},{name:"Race 8",time:"1:47:52.109"},{name:"Race 9",time:"1:23:38.271"}]},{_id:"5f3a3c5f4984bd9be6a6f655",picture:"http://placehold.it/64x64",age:39,name:"Richards Floyd",team:"VENDBLEND",races:[{name:"Race 0",time:"1:16:53.224"},{name:"Race 1",time:"1:31:32.533"},{name:"Race 2",time:"1:26:56.186"},{name:"Race 3",time:"1:0:15.169"},{name:"Race 4",time:"1:21:5.428"},{name:"Race 5",time:"1:26:18.202"},{name:"Race 6",time:"1:22:24.379"},{name:"Race 7",time:"1:22:9.316"},{name:"Race 8",time:"1:28:6.268"},{name:"Race 9",time:"1:57:56.461"}]},{_id:"5f3a3c5fc4c1a2c2dd9df702",picture:"http://placehold.it/64x64",age:39,name:"Jewel Mcdaniel",team:"GENESYNK",races:[{name:"Race 0",time:"1:4:42.549"},{name:"Race 1",time:"1:53:19.849"},{name:"Race 2",time:"1:51:25.667"},{name:"Race 3",time:"1:58:26.847"},{name:"Race 4",time:"1:47:42.841"},{name:"Race 5",time:"1:51:24.73"},{name:"Race 6",time:"1:4:0.075"},{name:"Race 7",time:"1:52:40.457"},{name:"Race 8",time:"1:18:17.738"},{name:"Race 9",time:"1:37:35.128"}]},{_id:"5f3a3c5f8a23c3e2c85cab74",picture:"http://placehold.it/64x64",age:21,name:"Welch Mays",team:"UXMOX",races:[{name:"Race 0",time:"1:21:48.956"},{name:"Race 1",time:"1:0:56.521"},{name:"Race 2",time:"1:53:9.793"},{name:"Race 3",time:"1:51:15.265"},{name:"Race 4",time:"1:59:43.968"},{name:"Race 5",time:"1:31:27.167"},{name:"Race 6",time:"1:59:49.156"},{name:"Race 7",time:"1:18:49.836"},{name:"Race 8",time:"1:47:46.692"},{name:"Race 9",time:"1:10:57.173"}]},{_id:"5f3a3c5f355a5be1fb74076a",picture:"http://placehold.it/64x64",age:28,name:"Lilian Levine",team:"UXMOX",races:[{name:"Race 0",time:"1:48:32.99"},{name:"Race 1",time:"1:1:41.043"},{name:"Race 2",time:"1:22:57.229"},{name:"Race 3",time:"1:4:40.618"},{name:"Race 4",time:"1:43:28.734"},{name:"Race 5",time:"1:59:19.861"},{name:"Race 6",time:"1:16:19.976"},{name:"Race 7",time:"1:28:39.612"},{name:"Race 8",time:"1:23:2.596"},{name:"Race 9",time:"1:38:32.305"}]},{_id:"5f3a3c5fc42b87fc0d6e31a9",picture:"http://placehold.it/64x64",age:27,name:"Harmon Mills",team:"GENESYNK",races:[{name:"Race 0",time:"1:38:45.622"},{name:"Race 1",time:"1:11:14.969"},{name:"Race 2",time:"1:46:46.861"},{name:"Race 3",time:"1:44:18.84"},{name:"Race 4",time:"1:42:3.761"},{name:"Race 5",time:"1:25:17.811"},{name:"Race 6",time:"1:12:57.672"},{name:"Race 7",time:"1:55:48.879"},{name:"Race 8",time:"1:34:55.445"},{name:"Race 9",time:"1:58:25.125"}]},{_id:"5f3a3c5f86cbcda872a8f1ed",picture:"http://placehold.it/64x64",age:24,name:"Olsen Donaldson",team:"DEVAWAY",races:[{name:"Race 0",time:"1:26:39.47"},{name:"Race 1",time:"1:8:11.491"},{name:"Race 2",time:"1:50:5.416"},{name:"Race 3",time:"1:48:56.726"},{name:"Race 4",time:"1:17:8.218"},{name:"Race 5",time:"1:26:42.32"},{name:"Race 6",time:"1:55:43.729"},{name:"Race 7",time:"1:6:13.931"},{name:"Race 8",time:"1:48:25.087"},{name:"Race 9",time:"1:52:38.604"}]},{_id:"5f3a3c5f65e328c1a1263781",picture:"http://placehold.it/64x64",age:29,name:"Anne Johnston",team:"DEVAWAY",races:[{name:"Race 0",time:"1:46:20.667"},{name:"Race 1",time:"1:25:48.31"},{name:"Race 2",time:"1:0:26.598"},{name:"Race 3",time:"1:40:54.377"},{name:"Race 4",time:"1:53:38.533"},{name:"Race 5",time:"1:27:11.601"},{name:"Race 6",time:"1:20:27.344"},{name:"Race 7",time:"1:48:58.123"},{name:"Race 8",time:"1:56:35.634"},{name:"Race 9",time:"1:47:46.822"}]},{_id:"5f3a3c5fde8d2bb91cab3352",picture:"http://placehold.it/64x64",age:31,name:"Cherie Fitzgerald",team:"EURON",races:[{name:"Race 0",time:"1:46:21.421"},{name:"Race 1",time:"1:43:5.956"},{name:"Race 2",time:"1:27:27.411"},{name:"Race 3",time:"1:32:43.108"},{name:"Race 4",time:"1:51:21.313"},{name:"Race 5",time:"1:23:48.083"},{name:"Race 6",time:"1:6:0.916"},{name:"Race 7",time:"1:57:54.609"},{name:"Race 8",time:"1:54:32.003"},{name:"Race 9",time:"1:31:15.369"}]},{_id:"5f3a3c5f5a4ce67633e028ad",picture:"http://placehold.it/64x64",age:29,name:"Debora Sears",team:"GENESYNK",races:[{name:"Race 0",time:"1:16:52.691"},{name:"Race 1",time:"1:20:32.393"},{name:"Race 2",time:"1:35:38.871"},{name:"Race 3",time:"1:35:16.146"},{name:"Race 4",time:"1:41:49.539"},{name:"Race 5",time:"1:57:46.918"},{name:"Race 6",time:"1:12:47.641"},{name:"Race 7",time:"1:55:52.599"},{name:"Race 8",time:"1:26:36.246"},{name:"Race 9",time:"1:22:26.748"}]},{_id:"5f3a3c5f0e202f4a527bf502",picture:"http://placehold.it/64x64",age:27,name:"Morris Combs",team:"EURON",races:[{name:"Race 0",time:"1:47:3.23"},{name:"Race 1",time:"1:28:54.578"},{name:"Race 2",time:"1:40:5.387"},{name:"Race 3",time:"1:28:49.392"},{name:"Race 4",time:"1:47:18.89"},{name:"Race 5",time:"1:11:2.444"},{name:"Race 6",time:"1:22:29.818"},{name:"Race 7",time:"1:4:24.429"},{name:"Race 8",time:"1:14:15.846"},{name:"Race 9",time:"1:39:5.08"}]},{_id:"5f3a3c5ff1c5e552442b292d",picture:"http://placehold.it/64x64",age:29,name:"Naomi Rutledge",team:"VENDBLEND",races:[{name:"Race 0",time:"1:44:36.643"},{name:"Race 1",time:"1:15:9.451"},{name:"Race 2",time:"1:50:37.69"},{name:"Race 3",time:"1:8:31.728"},{name:"Race 4",time:"1:32:50.154"},{name:"Race 5",time:"1:51:22.663"},{name:"Race 6",time:"1:30:35.122"},{name:"Race 7",time:"1:17:25.795"},{name:"Race 8",time:"1:36:56.224"},{name:"Race 9",time:"1:32:52.749"}]},{_id:"5f3a3c5f086b43d06ac5a984",picture:"http://placehold.it/64x64",age:35,name:"Guerra Rosario",team:"DEVAWAY",races:[{name:"Race 0",time:"1:22:53.242"},{name:"Race 1",time:"1:54:8.187"},{name:"Race 2",time:"1:1:5.747"},{name:"Race 3",time:"1:44:13.98"},{name:"Race 4",time:"1:30:28.754"},{name:"Race 5",time:"1:13:14.073"},{name:"Race 6",time:"1:41:58.781"},{name:"Race 7",time:"1:8:10.042"},{name:"Race 8",time:"1:54:42.966"},{name:"Race 9",time:"1:58:35.652"}]},{_id:"5f3a3c5f2744fa89349fe0f3",picture:"http://placehold.it/64x64",age:34,name:"Nguyen Fletcher",team:"GENESYNK",races:[{name:"Race 0",time:"1:8:15.559"},{name:"Race 1",time:"1:50:21.71"},{name:"Race 2",time:"1:4:55.952"},{name:"Race 3",time:"1:34:18.34"},{name:"Race 4",time:"1:59:9.568"},{name:"Race 5",time:"1:59:42.241"},{name:"Race 6",time:"1:46:33.387"},{name:"Race 7",time:"1:55:49.791"},{name:"Race 8",time:"1:29:4.4"},{name:"Race 9",time:"1:45:37.349"}]},{_id:"5f3a3c5f970bc40e21b8ee63",picture:"http://placehold.it/64x64",age:27,name:"Lisa Montoya",team:"GENESYNK",races:[{name:"Race 0",time:"1:19:38.374"},{name:"Race 1",time:"1:52:42.372"},{name:"Race 2",time:"1:59:9.399"},{name:"Race 3",time:"1:33:33.531"},{name:"Race 4",time:"1:15:15.002"},{name:"Race 5",time:"1:12:1.19"},{name:"Race 6",time:"1:56:48.602"},{name:"Race 7",time:"1:49:20.073"},{name:"Race 8",time:"1:53:21.555"},{name:"Race 9",time:"1:40:52.086"}]},{_id:"5f3a3c5f0a5f78c603fc1d14",picture:"http://placehold.it/64x64",age:30,name:"Misty Marsh",team:"UXMOX",races:[{name:"Race 0",time:"1:39:54.655"},{name:"Race 1",time:"1:26:8.059"},{name:"Race 2",time:"1:23:11.046"},{name:"Race 3",time:"1:41:4.32"},{name:"Race 4",time:"1:9:53.404"},{name:"Race 5",time:"1:13:42.517"},{name:"Race 6",time:"1:48:18.026"},{name:"Race 7",time:"1:55:3.198"},{name:"Race 8",time:"1:19:46.733"},{name:"Race 9",time:"1:40:17.202"}]},{_id:"5f3a3c5f876488cda4de309a",picture:"http://placehold.it/64x64",age:32,name:"Stanton Ayala",team:"CONFRENZY",races:[{name:"Race 0",time:"1:10:20.58"},{name:"Race 1",time:"1:53:44.181"},{name:"Race 2",time:"1:5:18.992"},{name:"Race 3",time:"1:47:55.459"},{name:"Race 4",time:"1:49:31.585"},{name:"Race 5",time:"1:38:20.841"},{name:"Race 6",time:"1:48:19.814"},{name:"Race 7",time:"1:36:18.023"},{name:"Race 8",time:"1:31:21.812"},{name:"Race 9",time:"1:48:26.514"}]},{_id:"5f3a3c5f8bd0087dc1b70b77",picture:"http://placehold.it/64x64",age:39,name:"Gilda Lindsay",team:"UXMOX",races:[{name:"Race 0",time:"1:53:0.702"},{name:"Race 1",time:"1:28:42.037"},{name:"Race 2",time:"1:53:24.687"},{name:"Race 3",time:"1:38:10.498"},{name:"Race 4",time:"1:46:58.467"},{name:"Race 5",time:"1:21:51.764"},{name:"Race 6",time:"1:2:8.072"},{name:"Race 7",time:"1:26:54.026"},{name:"Race 8",time:"1:56:31.087"},{name:"Race 9",time:"1:56:5.192"}]},{_id:"5f3a3c5f8df3fe2e8c6ae477",picture:"http://placehold.it/64x64",age:29,name:"Daniels Manning",team:"CONFRENZY",races:[{name:"Race 0",time:"1:0:57.037"},{name:"Race 1",time:"1:19:21.263"},{name:"Race 2",time:"1:16:58.378"},{name:"Race 3",time:"1:21:1.485"},{name:"Race 4",time:"1:16:2.04"},{name:"Race 5",time:"1:50:30.417"},{name:"Race 6",time:"1:54:33.324"},{name:"Race 7",time:"1:15:45.267"},{name:"Race 8",time:"1:2:42.528"},{name:"Race 9",time:"1:24:7.128"}]},{_id:"5f3a3c5f0c713e786503e798",picture:"http://placehold.it/64x64",age:39,name:"Howe Gaines",team:"VENDBLEND",races:[{name:"Race 0",time:"1:47:32.432"},{name:"Race 1",time:"1:40:12.872"},{name:"Race 2",time:"1:44:7.808"},{name:"Race 3",time:"1:47:10.399"},{name:"Race 4",time:"1:16:48.487"},{name:"Race 5",time:"1:35:58.714"},{name:"Race 6",time:"1:9:2.596"},{name:"Race 7",time:"1:58:10.066"},{name:"Race 8",time:"1:10:34.986"},{name:"Race 9",time:"1:11:36.368"}]},{_id:"5f3a3c5f37ce779261434517",picture:"http://placehold.it/64x64",age:24,name:"Hillary Leonard",team:"CONFRENZY",races:[{name:"Race 0",time:"1:48:28.477"},{name:"Race 1",time:"1:37:16.852"},{name:"Race 2",time:"1:7:36.766"},{name:"Race 3",time:"1:54:50.18"},{name:"Race 4",time:"1:11:35.705"},{name:"Race 5",time:"1:1:52.361"},{name:"Race 6",time:"1:15:58.031"},{name:"Race 7",time:"1:49:1.957"},{name:"Race 8",time:"1:50:46.778"},{name:"Race 9",time:"1:2:21.754"}]},{_id:"5f3a3c5fdc6f6738e4f35dd7",picture:"http://placehold.it/64x64",age:32,name:"Reva French",team:"GENESYNK",races:[{name:"Race 0",time:"1:53:36.228"},{name:"Race 1",time:"1:59:58.061"},{name:"Race 2",time:"1:27:19.038"},{name:"Race 3",time:"1:0:6.003"},{name:"Race 4",time:"1:6:38.885"},{name:"Race 5",time:"1:50:42.074"},{name:"Race 6",time:"1:42:55.71"},{name:"Race 7",time:"1:38:16.095"},{name:"Race 8",time:"1:56:0.979"},{name:"Race 9",time:"1:29:18.093"}]}];var data$1 = {data:data};

    var json = /*#__PURE__*/Object.freeze({
        __proto__: null,
        data: data,
        'default': data$1
    });

    /* src\App.svelte generated by Svelte v3.31.1 */
    const file$2 = "src\\App.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let header;
    	let t0;
    	let p0;
    	let p0_transition;
    	let t2;
    	let p1;
    	let p1_transition;
    	let t4;
    	let span;
    	let t6;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				fullTitle: /*appName*/ ctx[0],
    				shortTitle: "WKC"
    			},
    			$$inline: true
    		});

    	footer = new Footer({
    			props: {
    				author: "Miguel Villar",
    				owner: "devaway_"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(header.$$.fragment);
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = `${data[3].age}`;
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "HOLA";
    			t4 = space();
    			span = element("span");
    			span.textContent = `${/*icons*/ ctx[1][1]}`;
    			t6 = space();
    			create_component(footer.$$.fragment);
    			add_location(p0, file$2, 19, 1, 540);
    			add_location(p1, file$2, 20, 1, 614);
    			attr_dev(span, "class", "svelte-183niqg");
    			add_location(span, file$2, 30, 1, 834);
    			attr_dev(main, "class", "svelte-183niqg");
    			add_location(main, file$2, 16, 0, 475);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			append_dev(main, p0);
    			append_dev(main, t2);
    			append_dev(main, p1);
    			append_dev(main, t4);
    			append_dev(main, span);
    			append_dev(main, t6);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*appName*/ 1) header_changes.fullTitle = /*appName*/ ctx[0];
    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);

    			add_render_callback(() => {
    				if (!p0_transition) p0_transition = create_bidirectional_transition(p0, fly, { y: -200, duration: 2000 }, true);
    				p0_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!p1_transition) p1_transition = create_bidirectional_transition(p1, fade, {}, true);
    				p1_transition.run(1);
    			});

    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			if (!p0_transition) p0_transition = create_bidirectional_transition(p0, fly, { y: -200, duration: 2000 }, false);
    			p0_transition.run(0);
    			if (!p1_transition) p1_transition = create_bidirectional_transition(p1, fade, {}, false);
    			p1_transition.run(0);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			if (detaching && p0_transition) p0_transition.end();
    			if (detaching && p1_transition) p1_transition.end();
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { appName } = $$props;

    	//let json = loadData();
    	let icons = ["🏎", "🏁", "🏆", "🥇", "🥈", "🥉", "🕑", "ℹ"];

    	const writable_props = ["appName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("appName" in $$props) $$invalidate(0, appName = $$props.appName);
    	};

    	$$self.$capture_state = () => ({
    		appName,
    		Header,
    		Footer,
    		fly,
    		fade,
    		json,
    		icons
    	});

    	$$self.$inject_state = $$props => {
    		if ("appName" in $$props) $$invalidate(0, appName = $$props.appName);
    		if ("icons" in $$props) $$invalidate(1, icons = $$props.icons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [appName, icons];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { appName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*appName*/ ctx[0] === undefined && !("appName" in props)) {
    			console.warn("<App> was created without expected prop 'appName'");
    		}
    	}

    	get appName() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appName(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	intro: true,	// This is needed for Svelte Transitions to work at startup
    	props: {
    		appName: 'World Kart Championship'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
