
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
    function null_to_empty(value) {
        return value == null ? '' : value;
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
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
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
    const file = "src\\Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each capitalsFull as w}
    function create_each_block_1(ctx) {
    	let h1;
    	let t0_value = /*w*/ ctx[9].c.charAt(0) + "";
    	let t0;
    	let h1_transition;
    	let t1;
    	let span;
    	let t2_value = /*w*/ ctx[9].c.substring(1) + "";
    	let t2;
    	let t3_value = (/*w*/ ctx[9].x >= -200 ? space$1 : "") + "";
    	let t3;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = text(t3_value);
    			attr_dev(h1, "class", "svelte-1qybfgt");
    			add_location(h1, file, 18, 4, 613);
    			attr_dev(span, "class", "non-capital svelte-1qybfgt");
    			add_location(span, file, 19, 4, 689);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span, anchor);
    			append_dev(span, t2);
    			append_dev(span, t3);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*w*/ ctx[9].x, duration: 2000 }, true);
    				h1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 1500 }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*w*/ ctx[9].x, duration: 2000 }, false);
    			h1_transition.run(0);
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, { duration: 1500 }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching && h1_transition) h1_transition.end();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(18:4) {#each capitalsFull as w}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#each capitalsShort as c}
    function create_each_block(ctx) {
    	let h1;
    	let t0_value = /*c*/ ctx[6].c + "";
    	let t0;
    	let t1_value = (/*c*/ ctx[6].x >= -200 ? space$1 : "") + "";
    	let t1;
    	let h1_transition;
    	let current;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = text(t1_value);
    			attr_dev(h1, "class", "svelte-1qybfgt");
    			add_location(h1, file, 25, 4, 892);
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
    				if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*c*/ ctx[6].x, duration: 2000 }, true);
    				h1_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!h1_transition) h1_transition = create_bidirectional_transition(h1, fly, { x: /*c*/ ctx[6].x, duration: 2000 }, false);
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
    		source: "(25:4) {#each capitalsShort as c}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div0;
    	let t;
    	let div1;
    	let current;
    	let each_value_1 = /*capitalsFull*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*capitalsShort*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "full-text svelte-1qybfgt");
    			add_location(div0, file, 16, 0, 553);
    			attr_dev(div1, "class", "brief-text svelte-1qybfgt");
    			add_location(div1, file, 23, 0, 830);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*capitalsFull, space*/ 1) {
    				each_value_1 = /*capitalsFull*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*capitalsShort, space*/ 2) {
    				each_value = /*capitalsShort*/ ctx[1];
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
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div1);
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

    const space$1 = "   "; // JS's '\xa0' == &nbsp in HTML

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { longTitle } = $$props;
    	let { shortTitle } = $$props;
    	const titleWords = longTitle.split(" ");
    	const titleChars = shortTitle.split("");
    	const capitalsFull = [];
    	const capitalsShort = [];

    	titleWords.forEach((item, index) => {
    		capitalsFull.push({ c: item, x: (index + 1) * -100 });
    	});

    	titleChars.forEach((item, index) => {
    		capitalsShort.push({ c: item, x: (index + 1) * -100 });
    	});

    	const writable_props = ["longTitle", "shortTitle"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("longTitle" in $$props) $$invalidate(2, longTitle = $$props.longTitle);
    		if ("shortTitle" in $$props) $$invalidate(3, shortTitle = $$props.shortTitle);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		fly,
    		longTitle,
    		shortTitle,
    		titleWords,
    		titleChars,
    		capitalsFull,
    		capitalsShort,
    		space: space$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("longTitle" in $$props) $$invalidate(2, longTitle = $$props.longTitle);
    		if ("shortTitle" in $$props) $$invalidate(3, shortTitle = $$props.shortTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [capitalsFull, capitalsShort, longTitle, shortTitle];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { longTitle: 2, shortTitle: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*longTitle*/ ctx[2] === undefined && !("longTitle" in props)) {
    			console.warn("<Header> was created without expected prop 'longTitle'");
    		}

    		if (/*shortTitle*/ ctx[3] === undefined && !("shortTitle" in props)) {
    			console.warn("<Header> was created without expected prop 'shortTitle'");
    		}
    	}

    	get longTitle() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set longTitle(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shortTitle() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shortTitle(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\GlobalRankingPage.svelte generated by Svelte v3.31.1 */
    const file$1 = "src\\GlobalRankingPage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (88:8) {#each raceList as race, i}
    function create_each_block_1$1(ctx) {
    	let a;
    	let t_value = /*race*/ ctx[18] + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*i*/ ctx[17]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "svelte-rbyqid");
    			add_location(a, file$1, 88, 12, 2844);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*raceList*/ 2 && t_value !== (t_value = /*race*/ ctx[18] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(88:8) {#each raceList as race, i}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#each data as driver, i}
    function create_each_block$1(ctx) {
    	let div5;
    	let div1;
    	let div0;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t0;
    	let div2;
    	let t1_value = /*getTrophyIcon*/ ctx[5](/*i*/ ctx[17]) + "";
    	let t1;
    	let div2_class_value;
    	let t2;
    	let div3;
    	let t3_value = /*driver*/ ctx[15].name + "";
    	let t3;
    	let t4;
    	let div4;
    	let t5_value = /*driver*/ ctx[15].team + "";
    	let t5;
    	let t6;
    	let div5_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div3 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(img, "border", "0");
    			attr_dev(img, "alt", img_alt_value = /*driver*/ ctx[15].name);
    			if (img.src !== (img_src_value = /*driver*/ ctx[15].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "class", "svelte-rbyqid");
    			add_location(img, file$1, 105, 16, 3515);
    			attr_dev(div0, "class", "avatar svelte-rbyqid");
    			add_location(div0, file$1, 104, 12, 3477);
    			attr_dev(div1, "class", "column svelte-rbyqid");
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$1, 103, 8, 3421);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(/*i*/ ctx[17] <= 2 ? iconStyle : "column") + " svelte-rbyqid"));
    			set_style(div2, "flex-grow", "1");
    			add_location(div2, file$1, 108, 8, 3629);
    			attr_dev(div3, "class", "column svelte-rbyqid");
    			set_style(div3, "flex-grow", "3");
    			add_location(div3, file$1, 109, 8, 3730);
    			attr_dev(div4, "class", "column auto-hide svelte-rbyqid");
    			set_style(div4, "flex-grow", "2");
    			add_location(div4, file$1, 110, 8, 3801);
    			attr_dev(div5, "class", div5_class_value = "" + (null_to_empty(getRowStyle(/*i*/ ctx[17], /*data*/ ctx[0].length, false)) + " svelte-rbyqid"));
    			add_location(div5, file$1, 102, 4, 3327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div5, t0);
    			append_dev(div5, div2);
    			append_dev(div2, t1);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, t5);
    			append_dev(div5, t6);

    			if (!mounted) {
    				dispose = listen_dev(
    					div5,
    					"click",
    					function () {
    						if (is_function(/*onDriverSelect*/ ctx[4](/*driver*/ ctx[15]))) /*onDriverSelect*/ ctx[4](/*driver*/ ctx[15]).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*data*/ 1 && img_alt_value !== (img_alt_value = /*driver*/ ctx[15].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*data*/ 1 && img.src !== (img_src_value = /*driver*/ ctx[15].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 1 && t3_value !== (t3_value = /*driver*/ ctx[15].name + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*driver*/ ctx[15].team + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*data*/ 1 && div5_class_value !== (div5_class_value = "" + (null_to_empty(getRowStyle(/*i*/ ctx[17], /*data*/ ctx[0].length, false)) + " svelte-rbyqid"))) {
    				attr_dev(div5, "class", div5_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(102:4) {#each data as driver, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let h3;
    	let t0;
    	let t1;
    	let div1;
    	let button;
    	let t3;
    	let div0;
    	let t4;
    	let div8;
    	let div7;
    	let div3;
    	let t5;
    	let div4;
    	let t7;
    	let div5;
    	let t9;
    	let div6;
    	let t11;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*raceList*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text(/*rankingTitle*/ ctx[3]);
    			t1 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = "Select Race";
    			t3 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div3 = element("div");
    			t5 = space();
    			div4 = element("div");
    			div4.textContent = "Rank";
    			t7 = space();
    			div5 = element("div");
    			div5.textContent = "Name";
    			t9 = space();
    			div6 = element("div");
    			div6.textContent = "Team";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-rbyqid");
    			add_location(h3, file$1, 83, 4, 2591);
    			attr_dev(button, "class", "dropdown-button svelte-rbyqid");
    			add_location(button, file$1, 85, 8, 2652);
    			attr_dev(div0, "class", "dropdown-content svelte-rbyqid");
    			attr_dev(div0, "id", /*raceSelector*/ ctx[2]);
    			add_location(div0, file$1, 86, 8, 2743);
    			attr_dev(div1, "class", "dropdown svelte-rbyqid");
    			add_location(div1, file$1, 84, 4, 2620);
    			attr_dev(div2, "class", "container-header svelte-rbyqid");
    			add_location(div2, file$1, 82, 0, 2555);
    			attr_dev(div3, "class", "column svelte-rbyqid");
    			set_style(div3, "flex-grow", "1");
    			add_location(div3, file$1, 96, 8, 3033);
    			attr_dev(div4, "class", "column svelte-rbyqid");
    			set_style(div4, "flex-grow", "1");
    			add_location(div4, file$1, 97, 8, 3092);
    			attr_dev(div5, "class", "column svelte-rbyqid");
    			set_style(div5, "flex-grow", "3");
    			add_location(div5, file$1, 98, 8, 3154);
    			attr_dev(div6, "class", "column auto-hide svelte-rbyqid");
    			set_style(div6, "flex-grow", "2");
    			add_location(div6, file$1, 99, 8, 3216);
    			attr_dev(div7, "class", "row header svelte-rbyqid");
    			add_location(div7, file$1, 95, 4, 2999);
    			attr_dev(div8, "class", "container-table svelte-rbyqid");
    			add_location(div8, file$1, 94, 0, 2964);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div1, t3);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t4, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div3);
    			append_dev(div7, t5);
    			append_dev(div7, div4);
    			append_dev(div7, t7);
    			append_dev(div7, div5);
    			append_dev(div7, t9);
    			append_dev(div7, div6);
    			append_dev(div8, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div8, null);
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "click", /*onWindowClick*/ ctx[7], false, false, false),
    					listen_dev(button, "click", /*onDropdownClick*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rankingTitle*/ 8) set_data_dev(t0, /*rankingTitle*/ ctx[3]);

    			if (dirty & /*onSelectRaceId, raceList*/ 258) {
    				each_value_1 = /*raceList*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*raceSelector*/ 4) {
    				attr_dev(div0, "id", /*raceSelector*/ ctx[2]);
    			}

    			if (dirty & /*getRowStyle, data, onDriverSelect, iconStyle, getTrophyIcon*/ 49) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div8, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div8);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
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

    const prefixRankingTitle = "Ranking / ";
    const iconStyle = "column icon";

    function getRowStyle(index, length, firstRowDark = false, allowRadius = true, allowSolid = true) {
    	let style = "row";
    	let dark = firstRowDark ? 0 : 1;
    	if (allowRadius && index == 0) style += " first-row"; else if (allowRadius && index == length - 1) style += " last-row";
    	if (allowSolid) style += index % 2 == dark ? " solid-dark" : " solid-light";
    	return style;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GlobalRankingPage", slots, []);
    	let { data } = $$props;
    	let { raceList } = $$props;
    	let raceSelectId = -1; // -1 == Global Ranking
    	let raceSelector = "raceSelector";
    	let rankingTitle = prefixRankingTitle + raceList[0];
    	const trophyIconsGlobal = ["🏆", "🥈", "🥉"]; // ['🏎', '🏁', '🏆', '🥇', '🥈', '🥉', '🕑', 'ℹ'];
    	const trophyIconsRace = ["🥇", "🥈", "🥉"];
    	const dispatch = createEventDispatcher();

    	function onDriverSelect(driver) {
    		dispatch("message", { ...driver });
    	}

    	function getTrophyIcon(position) {
    		if (raceSelectId < 0) return position <= 2
    		? trophyIconsGlobal[position]
    		: position + 1; else return position <= 2 ? trophyIconsRace[position] : position + 1;
    	}

    	function sortDriversTable() {
    		if (raceSelectId < 0) {
    			$$invalidate(0, data = data.sort((a, b) => {
    				return a.globalPosition - b.globalPosition; // Global rankings
    				// Ascending order
    			}));
    		} else // Specific race ranking
    		{
    			$$invalidate(0, data = data.sort((a, b) => {
    				return a.races[raceSelectId].position - b.races[raceSelectId].position; // Ascending order
    			}));
    		}
    	}

    	function onDropdownClick() {
    		raceSelector.classList.toggle("show");
    	}

    	function onWindowClick(event) {
    		if (!event.target.matches(".dropdown-button")) {
    			if (raceSelector.classList.contains("show")) raceSelector.classList.remove("show");
    		}
    	}

    	function onSelectRaceId(raceId) {
    		raceSelectId = raceId - 1;
    		$$invalidate(3, rankingTitle = prefixRankingTitle + raceList[raceId]);
    		sortDriversTable();
    	}

    	onMount(() => {
    		sortDriversTable();
    		$$invalidate(2, raceSelector = document.getElementById("raceSelector"));
    	});

    	const writable_props = ["data", "raceList"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GlobalRankingPage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => {
    		onSelectRaceId(i);
    	};

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("raceList" in $$props) $$invalidate(1, raceList = $$props.raceList);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		data,
    		raceList,
    		raceSelectId,
    		raceSelector,
    		rankingTitle,
    		prefixRankingTitle,
    		iconStyle,
    		trophyIconsGlobal,
    		trophyIconsRace,
    		dispatch,
    		onDriverSelect,
    		getRowStyle,
    		getTrophyIcon,
    		sortDriversTable,
    		onDropdownClick,
    		onWindowClick,
    		onSelectRaceId
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("raceList" in $$props) $$invalidate(1, raceList = $$props.raceList);
    		if ("raceSelectId" in $$props) raceSelectId = $$props.raceSelectId;
    		if ("raceSelector" in $$props) $$invalidate(2, raceSelector = $$props.raceSelector);
    		if ("rankingTitle" in $$props) $$invalidate(3, rankingTitle = $$props.rankingTitle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		data,
    		raceList,
    		raceSelector,
    		rankingTitle,
    		onDriverSelect,
    		getTrophyIcon,
    		onDropdownClick,
    		onWindowClick,
    		onSelectRaceId,
    		click_handler
    	];
    }

    class GlobalRankingPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { data: 0, raceList: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GlobalRankingPage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<GlobalRankingPage> was created without expected prop 'data'");
    		}

    		if (/*raceList*/ ctx[1] === undefined && !("raceList" in props)) {
    			console.warn("<GlobalRankingPage> was created without expected prop 'raceList'");
    		}
    	}

    	get data() {
    		throw new Error("<GlobalRankingPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<GlobalRankingPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get raceList() {
    		throw new Error("<GlobalRankingPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set raceList(value) {
    		throw new Error("<GlobalRankingPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DriverCard.svelte generated by Svelte v3.31.1 */

    const file$2 = "src\\DriverCard.svelte";

    function create_fragment$2(ctx) {
    	let div11;
    	let div0;
    	let t1;
    	let div10;
    	let div1;
    	let img;
    	let img_alt_value;
    	let img_src_value;
    	let t2;
    	let div2;
    	let t4;
    	let div3;
    	let t5_value = /*data*/ ctx[0].name + "";
    	let t5;
    	let t6;
    	let div4;
    	let t8;
    	let div5;
    	let t9_value = /*data*/ ctx[0].age + "";
    	let t9;
    	let t10;
    	let div6;
    	let t12;
    	let div7;
    	let t13_value = /*data*/ ctx[0].team + "";
    	let t13;
    	let t14;
    	let div8;
    	let t16;
    	let div9;
    	let t17_value = /*getTrophyIcon*/ ctx[1](/*data*/ ctx[0].globalPosition) + "";
    	let t17;
    	let div9_class_value;

    	const block = {
    		c: function create() {
    			div11 = element("div");
    			div0 = element("div");
    			div0.textContent = "Driver Card";
    			t1 = space();
    			div10 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			div2.textContent = "Name";
    			t4 = space();
    			div3 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div4 = element("div");
    			div4.textContent = "Age";
    			t8 = space();
    			div5 = element("div");
    			t9 = text(t9_value);
    			t10 = space();
    			div6 = element("div");
    			div6.textContent = "Team";
    			t12 = space();
    			div7 = element("div");
    			t13 = text(t13_value);
    			t14 = space();
    			div8 = element("div");
    			div8.textContent = "Global Ranking";
    			t16 = space();
    			div9 = element("div");
    			t17 = text(t17_value);
    			attr_dev(div0, "class", "card-header svelte-roylet");
    			add_location(div0, file$2, 11, 4, 243);
    			attr_dev(img, "border", "0");
    			attr_dev(img, "alt", img_alt_value = /*data*/ ctx[0].name);
    			if (img.src !== (img_src_value = /*data*/ ctx[0].picture)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "100%");
    			attr_dev(img, "class", "svelte-roylet");
    			add_location(img, file$2, 14, 12, 358);
    			attr_dev(div1, "class", "avatar svelte-roylet");
    			add_location(div1, file$2, 13, 8, 324);
    			attr_dev(div2, "class", "title svelte-roylet");
    			add_location(div2, file$2, 17, 8, 458);
    			attr_dev(div3, "class", "desc svelte-roylet");
    			add_location(div3, file$2, 18, 8, 497);
    			attr_dev(div4, "class", "title svelte-roylet");
    			add_location(div4, file$2, 20, 8, 544);
    			attr_dev(div5, "class", "desc svelte-roylet");
    			add_location(div5, file$2, 21, 8, 582);
    			attr_dev(div6, "class", "title svelte-roylet");
    			add_location(div6, file$2, 23, 8, 628);
    			attr_dev(div7, "class", "desc svelte-roylet");
    			add_location(div7, file$2, 24, 8, 667);
    			attr_dev(div8, "class", "title svelte-roylet");
    			add_location(div8, file$2, 26, 8, 714);
    			attr_dev(div9, "class", div9_class_value = "" + (null_to_empty(/*data*/ ctx[0].globalPosition <= 3 ? "icon" : "desc") + " svelte-roylet"));
    			add_location(div9, file$2, 27, 8, 763);
    			attr_dev(div10, "class", "card-body svelte-roylet");
    			add_location(div10, file$2, 12, 4, 291);
    			attr_dev(div11, "class", "card-container svelte-roylet");
    			add_location(div11, file$2, 10, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div11, anchor);
    			append_dev(div11, div0);
    			append_dev(div11, t1);
    			append_dev(div11, div10);
    			append_dev(div10, div1);
    			append_dev(div1, img);
    			append_dev(div10, t2);
    			append_dev(div10, div2);
    			append_dev(div10, t4);
    			append_dev(div10, div3);
    			append_dev(div3, t5);
    			append_dev(div10, t6);
    			append_dev(div10, div4);
    			append_dev(div10, t8);
    			append_dev(div10, div5);
    			append_dev(div5, t9);
    			append_dev(div10, t10);
    			append_dev(div10, div6);
    			append_dev(div10, t12);
    			append_dev(div10, div7);
    			append_dev(div7, t13);
    			append_dev(div10, t14);
    			append_dev(div10, div8);
    			append_dev(div10, t16);
    			append_dev(div10, div9);
    			append_dev(div9, t17);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*data*/ 1 && img_alt_value !== (img_alt_value = /*data*/ ctx[0].name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*data*/ 1 && img.src !== (img_src_value = /*data*/ ctx[0].picture)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*data*/ 1 && t5_value !== (t5_value = /*data*/ ctx[0].name + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*data*/ 1 && t9_value !== (t9_value = /*data*/ ctx[0].age + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*data*/ 1 && t13_value !== (t13_value = /*data*/ ctx[0].team + "")) set_data_dev(t13, t13_value);
    			if (dirty & /*data*/ 1 && t17_value !== (t17_value = /*getTrophyIcon*/ ctx[1](/*data*/ ctx[0].globalPosition) + "")) set_data_dev(t17, t17_value);

    			if (dirty & /*data*/ 1 && div9_class_value !== (div9_class_value = "" + (null_to_empty(/*data*/ ctx[0].globalPosition <= 3 ? "icon" : "desc") + " svelte-roylet"))) {
    				attr_dev(div9, "class", div9_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div11);
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
    	validate_slots("DriverCard", slots, []);
    	let { data } = $$props;
    	const trophyIcons = ["🥇", "🥈", "🥉"];

    	function getTrophyIcon(position) {
    		return position <= 3 ? trophyIcons[position - 1] : position;
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DriverCard> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({ data, trophyIcons, getTrophyIcon });

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, getTrophyIcon];
    }

    class DriverCard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DriverCard",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<DriverCard> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DriverCard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DriverCard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DriverResults.svelte generated by Svelte v3.31.1 */

    const file$3 = "src\\DriverResults.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (32:4) {#each data.races as race, i}
    function create_each_block$2(ctx) {
    	let div3;
    	let div0;
    	let t0_value = /*race*/ ctx[3].name + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2_value = /*getTrophyIcon*/ ctx[1](/*race*/ ctx[3].position) + "";
    	let t2;
    	let div1_class_value;
    	let t3;
    	let div2;
    	let t4_value = /*race*/ ctx[3].time + "";
    	let t4;
    	let t5;
    	let div3_class_value;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			attr_dev(div0, "class", "column svelte-1mn9ud0");
    			set_style(div0, "flex-grow", "1");
    			add_location(div0, file$3, 33, 8, 1071);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*race*/ ctx[3].position <= 3 ? "column icon" : "column") + " svelte-1mn9ud0"));
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$3, 34, 8, 1140);
    			attr_dev(div2, "class", "column svelte-1mn9ud0");
    			set_style(div2, "flex-grow", "2");
    			add_location(div2, file$3, 35, 8, 1269);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty(getRowStyle$1(/*i*/ ctx[5], /*data*/ ctx[0].races.length, true, true, false)) + " svelte-1mn9ud0"));
    			add_location(div3, file$3, 32, 4, 993);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div3, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && t0_value !== (t0_value = /*race*/ ctx[3].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*data*/ 1 && t2_value !== (t2_value = /*getTrophyIcon*/ ctx[1](/*race*/ ctx[3].position) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*data*/ 1 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*race*/ ctx[3].position <= 3 ? "column icon" : "column") + " svelte-1mn9ud0"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*data*/ 1 && t4_value !== (t4_value = /*race*/ ctx[3].time + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*data*/ 1 && div3_class_value !== (div3_class_value = "" + (null_to_empty(getRowStyle$1(/*i*/ ctx[5], /*data*/ ctx[0].races.length, true, true, false)) + " svelte-1mn9ud0"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:4) {#each data.races as race, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let each_value = /*data*/ ctx[0].races;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			div0.textContent = "Race";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "Position";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Time";
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "column svelte-1mn9ud0");
    			set_style(div0, "flex-grow", "1");
    			add_location(div0, file$3, 27, 8, 760);
    			attr_dev(div1, "class", "column svelte-1mn9ud0");
    			set_style(div1, "flex-grow", "1");
    			add_location(div1, file$3, 28, 8, 822);
    			attr_dev(div2, "class", "column svelte-1mn9ud0");
    			set_style(div2, "flex-grow", "2");
    			add_location(div2, file$3, 29, 8, 888);
    			attr_dev(div3, "class", "row header svelte-1mn9ud0");
    			add_location(div3, file$3, 26, 4, 726);
    			attr_dev(div4, "class", "table-container svelte-1mn9ud0");
    			add_location(div4, file$3, 25, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div4, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div4, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getRowStyle, data, getTrophyIcon*/ 3) {
    				each_value = /*data*/ ctx[0].races;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div4, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getRowStyle$1(index, length, firstRowDark = false, allowRadius = true, allowSolid = true) {
    	let style = "row";
    	let dark = firstRowDark ? 0 : 1;
    	if (allowRadius && index == 0) style += " first-row"; else if (allowRadius && index == length - 1) style += " last-row";
    	if (allowSolid) style += index % 2 == dark ? " solid-dark" : " solid-light";
    	return style;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DriverResults", slots, []);
    	let { data } = $$props;
    	const trophyIcons = ["🥇", "🥈", "🥉"];

    	function getTrophyIcon(position) {
    		return position <= 3 ? trophyIcons[position - 1] : position;
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DriverResults> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		data,
    		trophyIcons,
    		getTrophyIcon,
    		getRowStyle: getRowStyle$1
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, getTrophyIcon];
    }

    class DriverResults extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DriverResults",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<DriverResults> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DriverResults>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DriverResults>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\DriverInfoPage.svelte generated by Svelte v3.31.1 */
    const file$4 = "src\\DriverInfoPage.svelte";

    function create_fragment$4(ctx) {
    	let div0;
    	let h3;
    	let t1;
    	let button;
    	let t3;
    	let div1;
    	let drivercard;
    	let t4;
    	let driverresults;
    	let current;
    	let mounted;
    	let dispose;

    	drivercard = new DriverCard({
    			props: { data: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	driverresults = new DriverResults({
    			props: { data: /*data*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Driver Season Results";
    			t1 = space();
    			button = element("button");
    			button.textContent = "Back";
    			t3 = space();
    			div1 = element("div");
    			create_component(drivercard.$$.fragment);
    			t4 = space();
    			create_component(driverresults.$$.fragment);
    			attr_dev(h3, "class", "svelte-153anb7");
    			add_location(h3, file$4, 16, 4, 352);
    			attr_dev(button, "class", "svelte-153anb7");
    			add_location(button, file$4, 17, 4, 388);
    			attr_dev(div0, "class", "header svelte-153anb7");
    			add_location(div0, file$4, 15, 0, 326);
    			attr_dev(div1, "class", "content svelte-153anb7");
    			add_location(div1, file$4, 20, 0, 439);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(div0, t1);
    			append_dev(div0, button);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(drivercard, div1, null);
    			append_dev(div1, t4);
    			mount_component(driverresults, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onBack*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const drivercard_changes = {};
    			if (dirty & /*data*/ 1) drivercard_changes.data = /*data*/ ctx[0];
    			drivercard.$set(drivercard_changes);
    			const driverresults_changes = {};
    			if (dirty & /*data*/ 1) driverresults_changes.data = /*data*/ ctx[0];
    			driverresults.$set(driverresults_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(drivercard.$$.fragment, local);
    			transition_in(driverresults.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(drivercard.$$.fragment, local);
    			transition_out(driverresults.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			destroy_component(drivercard);
    			destroy_component(driverresults);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("DriverInfoPage", slots, []);
    	let { data } = $$props;
    	const dispatch = createEventDispatcher();

    	function onBack() {
    		dispatch("message", { action: "back" });
    	}

    	const writable_props = ["data"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DriverInfoPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		DriverCard,
    		DriverResults,
    		data,
    		dispatch,
    		onBack
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, onBack];
    }

    class DriverInfoPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DriverInfoPage",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<DriverInfoPage> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<DriverInfoPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<DriverInfoPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var data=[{_id:"5f3a3c5faa55d5c4ea549ac1",picture:"http://placehold.it/64x64",age:38,name:"Padilla Adkins",team:"EURON",races:[{name:"Race 0",time:"1:11:39.515"},{name:"Race 1",time:"1:17:24.312"},{name:"Race 2",time:"1:22:29.376"},{name:"Race 3",time:"1:10:34.491"},{name:"Race 4",time:"1:51:45.103"},{name:"Race 5",time:"1:44:16.158"},{name:"Race 6",time:"1:30:14.658"},{name:"Race 7",time:"1:29:41.505"},{name:"Race 8",time:"1:47:52.109"},{name:"Race 9",time:"1:23:38.271"}]},{_id:"5f3a3c5f4984bd9be6a6f655",picture:"http://placehold.it/64x64",age:39,name:"Richards Floyd",team:"VENDBLEND",races:[{name:"Race 0",time:"1:16:53.224"},{name:"Race 1",time:"1:31:32.533"},{name:"Race 2",time:"1:26:56.186"},{name:"Race 3",time:"1:0:15.169"},{name:"Race 4",time:"1:21:5.428"},{name:"Race 5",time:"1:26:18.202"},{name:"Race 6",time:"1:22:24.379"},{name:"Race 7",time:"1:22:9.316"},{name:"Race 8",time:"1:28:6.268"},{name:"Race 9",time:"1:57:56.461"}]},{_id:"5f3a3c5fc4c1a2c2dd9df702",picture:"http://placehold.it/64x64",age:39,name:"Jewel Mcdaniel",team:"GENESYNK",races:[{name:"Race 0",time:"1:4:42.549"},{name:"Race 1",time:"1:53:19.849"},{name:"Race 2",time:"1:51:25.667"},{name:"Race 3",time:"1:58:26.847"},{name:"Race 4",time:"1:47:42.841"},{name:"Race 5",time:"1:51:24.73"},{name:"Race 6",time:"1:4:0.075"},{name:"Race 7",time:"1:52:40.457"},{name:"Race 8",time:"1:18:17.738"},{name:"Race 9",time:"1:37:35.128"}]},{_id:"5f3a3c5f8a23c3e2c85cab74",picture:"http://placehold.it/64x64",age:21,name:"Welch Mays",team:"UXMOX",races:[{name:"Race 0",time:"1:21:48.956"},{name:"Race 1",time:"1:0:56.521"},{name:"Race 2",time:"1:53:9.793"},{name:"Race 3",time:"1:51:15.265"},{name:"Race 4",time:"1:59:43.968"},{name:"Race 5",time:"1:31:27.167"},{name:"Race 6",time:"1:59:49.156"},{name:"Race 7",time:"1:18:49.836"},{name:"Race 8",time:"1:47:46.692"},{name:"Race 9",time:"1:10:57.173"}]},{_id:"5f3a3c5f355a5be1fb74076a",picture:"http://placehold.it/64x64",age:28,name:"Lilian Levine",team:"UXMOX",races:[{name:"Race 0",time:"1:48:32.99"},{name:"Race 1",time:"1:1:41.043"},{name:"Race 2",time:"1:22:57.229"},{name:"Race 3",time:"1:4:40.618"},{name:"Race 4",time:"1:43:28.734"},{name:"Race 5",time:"1:59:19.861"},{name:"Race 6",time:"1:16:19.976"},{name:"Race 7",time:"1:28:39.612"},{name:"Race 8",time:"1:23:2.596"},{name:"Race 9",time:"1:38:32.305"}]},{_id:"5f3a3c5fc42b87fc0d6e31a9",picture:"http://placehold.it/64x64",age:27,name:"Harmon Mills",team:"GENESYNK",races:[{name:"Race 0",time:"1:38:45.622"},{name:"Race 1",time:"1:11:14.969"},{name:"Race 2",time:"1:46:46.861"},{name:"Race 3",time:"1:44:18.84"},{name:"Race 4",time:"1:42:3.761"},{name:"Race 5",time:"1:25:17.811"},{name:"Race 6",time:"1:12:57.672"},{name:"Race 7",time:"1:55:48.879"},{name:"Race 8",time:"1:34:55.445"},{name:"Race 9",time:"1:58:25.125"}]},{_id:"5f3a3c5f86cbcda872a8f1ed",picture:"http://placehold.it/64x64",age:24,name:"Olsen Donaldson",team:"DEVAWAY",races:[{name:"Race 0",time:"1:26:39.47"},{name:"Race 1",time:"1:8:11.491"},{name:"Race 2",time:"1:50:5.416"},{name:"Race 3",time:"1:48:56.726"},{name:"Race 4",time:"1:17:8.218"},{name:"Race 5",time:"1:26:42.32"},{name:"Race 6",time:"1:55:43.729"},{name:"Race 7",time:"1:6:13.931"},{name:"Race 8",time:"1:48:25.087"},{name:"Race 9",time:"1:52:38.604"}]},{_id:"5f3a3c5f65e328c1a1263781",picture:"http://placehold.it/64x64",age:29,name:"Anne Johnston",team:"DEVAWAY",races:[{name:"Race 0",time:"1:46:20.667"},{name:"Race 1",time:"1:25:48.31"},{name:"Race 2",time:"1:0:26.598"},{name:"Race 3",time:"1:40:54.377"},{name:"Race 4",time:"1:53:38.533"},{name:"Race 5",time:"1:27:11.601"},{name:"Race 6",time:"1:20:27.344"},{name:"Race 7",time:"1:48:58.123"},{name:"Race 8",time:"1:56:35.634"},{name:"Race 9",time:"1:47:46.822"}]},{_id:"5f3a3c5fde8d2bb91cab3352",picture:"http://placehold.it/64x64",age:31,name:"Cherie Fitzgerald",team:"EURON",races:[{name:"Race 0",time:"1:46:21.421"},{name:"Race 1",time:"1:43:5.956"},{name:"Race 2",time:"1:27:27.411"},{name:"Race 3",time:"1:32:43.108"},{name:"Race 4",time:"1:51:21.313"},{name:"Race 5",time:"1:23:48.083"},{name:"Race 6",time:"1:6:0.916"},{name:"Race 7",time:"1:57:54.609"},{name:"Race 8",time:"1:54:32.003"},{name:"Race 9",time:"1:31:15.369"}]},{_id:"5f3a3c5f5a4ce67633e028ad",picture:"http://placehold.it/64x64",age:29,name:"Debora Sears",team:"GENESYNK",races:[{name:"Race 0",time:"1:16:52.691"},{name:"Race 1",time:"1:20:32.393"},{name:"Race 2",time:"1:35:38.871"},{name:"Race 3",time:"1:35:16.146"},{name:"Race 4",time:"1:41:49.539"},{name:"Race 5",time:"1:57:46.918"},{name:"Race 6",time:"1:12:47.641"},{name:"Race 7",time:"1:55:52.599"},{name:"Race 8",time:"1:26:36.246"},{name:"Race 9",time:"1:22:26.748"}]},{_id:"5f3a3c5f0e202f4a527bf502",picture:"http://placehold.it/64x64",age:27,name:"Morris Combs",team:"EURON",races:[{name:"Race 0",time:"1:47:3.23"},{name:"Race 1",time:"1:28:54.578"},{name:"Race 2",time:"1:40:5.387"},{name:"Race 3",time:"1:28:49.392"},{name:"Race 4",time:"1:47:18.89"},{name:"Race 5",time:"1:11:2.444"},{name:"Race 6",time:"1:22:29.818"},{name:"Race 7",time:"1:4:24.429"},{name:"Race 8",time:"1:14:15.846"},{name:"Race 9",time:"1:39:5.08"}]},{_id:"5f3a3c5ff1c5e552442b292d",picture:"http://placehold.it/64x64",age:29,name:"Naomi Rutledge",team:"VENDBLEND",races:[{name:"Race 0",time:"1:44:36.643"},{name:"Race 1",time:"1:15:9.451"},{name:"Race 2",time:"1:50:37.69"},{name:"Race 3",time:"1:8:31.728"},{name:"Race 4",time:"1:32:50.154"},{name:"Race 5",time:"1:51:22.663"},{name:"Race 6",time:"1:30:35.122"},{name:"Race 7",time:"1:17:25.795"},{name:"Race 8",time:"1:36:56.224"},{name:"Race 9",time:"1:32:52.749"}]},{_id:"5f3a3c5f086b43d06ac5a984",picture:"http://placehold.it/64x64",age:35,name:"Guerra Rosario",team:"DEVAWAY",races:[{name:"Race 0",time:"1:22:53.242"},{name:"Race 1",time:"1:54:8.187"},{name:"Race 2",time:"1:1:5.747"},{name:"Race 3",time:"1:44:13.98"},{name:"Race 4",time:"1:30:28.754"},{name:"Race 5",time:"1:13:14.073"},{name:"Race 6",time:"1:41:58.781"},{name:"Race 7",time:"1:8:10.042"},{name:"Race 8",time:"1:54:42.966"},{name:"Race 9",time:"1:58:35.652"}]},{_id:"5f3a3c5f2744fa89349fe0f3",picture:"http://placehold.it/64x64",age:34,name:"Nguyen Fletcher",team:"GENESYNK",races:[{name:"Race 0",time:"1:8:15.559"},{name:"Race 1",time:"1:50:21.71"},{name:"Race 2",time:"1:4:55.952"},{name:"Race 3",time:"1:34:18.34"},{name:"Race 4",time:"1:59:9.568"},{name:"Race 5",time:"1:59:42.241"},{name:"Race 6",time:"1:46:33.387"},{name:"Race 7",time:"1:55:49.791"},{name:"Race 8",time:"1:29:4.4"},{name:"Race 9",time:"1:45:37.349"}]},{_id:"5f3a3c5f970bc40e21b8ee63",picture:"http://placehold.it/64x64",age:27,name:"Lisa Montoya",team:"GENESYNK",races:[{name:"Race 0",time:"1:19:38.374"},{name:"Race 1",time:"1:52:42.372"},{name:"Race 2",time:"1:59:9.399"},{name:"Race 3",time:"1:33:33.531"},{name:"Race 4",time:"1:15:15.002"},{name:"Race 5",time:"1:12:1.19"},{name:"Race 6",time:"1:56:48.602"},{name:"Race 7",time:"1:49:20.073"},{name:"Race 8",time:"1:53:21.555"},{name:"Race 9",time:"1:40:52.086"}]},{_id:"5f3a3c5f0a5f78c603fc1d14",picture:"http://placehold.it/64x64",age:30,name:"Misty Marsh",team:"UXMOX",races:[{name:"Race 0",time:"1:39:54.655"},{name:"Race 1",time:"1:26:8.059"},{name:"Race 2",time:"1:23:11.046"},{name:"Race 3",time:"1:41:4.32"},{name:"Race 4",time:"1:9:53.404"},{name:"Race 5",time:"1:13:42.517"},{name:"Race 6",time:"1:48:18.026"},{name:"Race 7",time:"1:55:3.198"},{name:"Race 8",time:"1:19:46.733"},{name:"Race 9",time:"1:40:17.202"}]},{_id:"5f3a3c5f876488cda4de309a",picture:"http://placehold.it/64x64",age:32,name:"Stanton Ayala",team:"CONFRENZY",races:[{name:"Race 0",time:"1:10:20.58"},{name:"Race 1",time:"1:53:44.181"},{name:"Race 2",time:"1:5:18.992"},{name:"Race 3",time:"1:47:55.459"},{name:"Race 4",time:"1:49:31.585"},{name:"Race 5",time:"1:38:20.841"},{name:"Race 6",time:"1:48:19.814"},{name:"Race 7",time:"1:36:18.023"},{name:"Race 8",time:"1:31:21.812"},{name:"Race 9",time:"1:48:26.514"}]},{_id:"5f3a3c5f8bd0087dc1b70b77",picture:"http://placehold.it/64x64",age:39,name:"Gilda Lindsay",team:"UXMOX",races:[{name:"Race 0",time:"1:53:0.702"},{name:"Race 1",time:"1:28:42.037"},{name:"Race 2",time:"1:53:24.687"},{name:"Race 3",time:"1:38:10.498"},{name:"Race 4",time:"1:46:58.467"},{name:"Race 5",time:"1:21:51.764"},{name:"Race 6",time:"1:2:8.072"},{name:"Race 7",time:"1:26:54.026"},{name:"Race 8",time:"1:56:31.087"},{name:"Race 9",time:"1:56:5.192"}]},{_id:"5f3a3c5f8df3fe2e8c6ae477",picture:"http://placehold.it/64x64",age:29,name:"Daniels Manning",team:"CONFRENZY",races:[{name:"Race 0",time:"1:0:57.037"},{name:"Race 1",time:"1:19:21.263"},{name:"Race 2",time:"1:16:58.378"},{name:"Race 3",time:"1:21:1.485"},{name:"Race 4",time:"1:16:2.04"},{name:"Race 5",time:"1:50:30.417"},{name:"Race 6",time:"1:54:33.324"},{name:"Race 7",time:"1:15:45.267"},{name:"Race 8",time:"1:2:42.528"},{name:"Race 9",time:"1:24:7.128"}]},{_id:"5f3a3c5f0c713e786503e798",picture:"http://placehold.it/64x64",age:39,name:"Howe Gaines",team:"VENDBLEND",races:[{name:"Race 0",time:"1:47:32.432"},{name:"Race 1",time:"1:40:12.872"},{name:"Race 2",time:"1:44:7.808"},{name:"Race 3",time:"1:47:10.399"},{name:"Race 4",time:"1:16:48.487"},{name:"Race 5",time:"1:35:58.714"},{name:"Race 6",time:"1:9:2.596"},{name:"Race 7",time:"1:58:10.066"},{name:"Race 8",time:"1:10:34.986"},{name:"Race 9",time:"1:11:36.368"}]},{_id:"5f3a3c5f37ce779261434517",picture:"http://placehold.it/64x64",age:24,name:"Hillary Leonard",team:"CONFRENZY",races:[{name:"Race 0",time:"1:48:28.477"},{name:"Race 1",time:"1:37:16.852"},{name:"Race 2",time:"1:7:36.766"},{name:"Race 3",time:"1:54:50.18"},{name:"Race 4",time:"1:11:35.705"},{name:"Race 5",time:"1:1:52.361"},{name:"Race 6",time:"1:15:58.031"},{name:"Race 7",time:"1:49:1.957"},{name:"Race 8",time:"1:50:46.778"},{name:"Race 9",time:"1:2:21.754"}]},{_id:"5f3a3c5fdc6f6738e4f35dd7",picture:"http://placehold.it/64x64",age:32,name:"Reva French",team:"GENESYNK",races:[{name:"Race 0",time:"1:53:36.228"},{name:"Race 1",time:"1:59:58.061"},{name:"Race 2",time:"1:27:19.038"},{name:"Race 3",time:"1:0:6.003"},{name:"Race 4",time:"1:6:38.885"},{name:"Race 5",time:"1:50:42.074"},{name:"Race 6",time:"1:42:55.71"},{name:"Race 7",time:"1:38:16.095"},{name:"Race 8",time:"1:56:0.979"},{name:"Race 9",time:"1:29:18.093"}]}];var data$1 = {data:data};

    var clientData = /*#__PURE__*/Object.freeze({
        __proto__: null,
        data: data,
        'default': data$1
    });

    /* src\Content.svelte generated by Svelte v3.31.1 */

    // (86:0) {:else}
    function create_else_block(ctx) {
    	let driverinfopage;
    	let current;

    	driverinfopage = new DriverInfoPage({
    			props: { data: /*driverInfo*/ ctx[1] },
    			$$inline: true
    		});

    	driverinfopage.$on("message", /*onBack*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(driverinfopage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(driverinfopage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const driverinfopage_changes = {};
    			if (dirty & /*driverInfo*/ 2) driverinfopage_changes.data = /*driverInfo*/ ctx[1];
    			driverinfopage.$set(driverinfopage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(driverinfopage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(driverinfopage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(driverinfopage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(86:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#if !showDriverInfo}
    function create_if_block(ctx) {
    	let globalrankingpage;
    	let current;

    	globalrankingpage = new GlobalRankingPage({
    			props: {
    				data: /*data*/ ctx[2],
    				raceList: /*raceList*/ ctx[3]
    			},
    			$$inline: true
    		});

    	globalrankingpage.$on("message", /*onDriverSelect*/ ctx[4]);

    	const block = {
    		c: function create() {
    			create_component(globalrankingpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(globalrankingpage, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(globalrankingpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(globalrankingpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(globalrankingpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(84:0) {#if !showDriverInfo}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*showDriverInfo*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getTimeInMilliseconds(time) {
    	// Client time format is like this: "1:11:39.515"
    	let timeSplit = time.split(":");

    	let hours = parseInt(timeSplit[0]) * 60 * 60 * 1000;
    	let minutes = parseInt(timeSplit[1]) * 60 * 1000;
    	let seconds = parseInt(timeSplit[2].split((".")[0])) * 1000;
    	let milliseconds = parseInt(timeSplit[2].split((".")[1]));
    	return hours + minutes + seconds + milliseconds;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Content", slots, []);
    	let showDriverInfo = false;
    	let driverInfo;
    	let data$1 = data;

    	const raceList = data$1[0].races.map(item => {
    		return item.name;
    	});

    	raceList.unshift("Global");

    	function cacheDriversSortListByRace(raceId) {
    		data$1.sort((a, b) => {
    			let raceTimeA = getTimeInMilliseconds(a.races[raceId].time);
    			let raceTimeB = getTimeInMilliseconds(b.races[raceId].time);
    			return raceTimeA - raceTimeB; // Ascending order
    		});

    		// Position data caching
    		data$1.forEach((driver, position) => {
    			driver.races[raceId].position = position + 1;
    		});
    	}

    	function cacheDriversSortListGlobally() {
    		data$1.sort((a, b) => {
    			let totalPositionsA = a.races.reduce((total, curr) => {
    				total = typeof total === "Number" ? total : 0;
    				return total + curr.position;
    			});

    			let totalPositionsB = b.races.reduce((total, curr) => {
    				total = typeof total === "Number" ? total : 0;
    				return total + curr.position;
    			});

    			return totalPositionsA - totalPositionsB; // Ascending order
    		});

    		// Position data caching
    		data$1.forEach((driver, position) => {
    			driver.globalPosition = position + 1;
    		});
    	}

    	function cacheDriversSortList() {
    		for (let i = 0; i < raceList.length - 1; i++) {
    			cacheDriversSortListByRace(i);
    		}

    		cacheDriversSortListGlobally();
    	} //console.log(JSON.stringify(data));

    	function onDriverSelect(event) {
    		$$invalidate(0, showDriverInfo = true);
    		$$invalidate(1, driverInfo = { ...event.detail });
    	}

    	function onBack(event) {
    		$$invalidate(0, showDriverInfo = false);
    	}

    	onMount(() => {
    		cacheDriversSortList();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		GlobalRankingPage,
    		DriverInfoPage,
    		clientData,
    		showDriverInfo,
    		driverInfo,
    		data: data$1,
    		raceList,
    		getTimeInMilliseconds,
    		cacheDriversSortListByRace,
    		cacheDriversSortListGlobally,
    		cacheDriversSortList,
    		onDriverSelect,
    		onBack
    	});

    	$$self.$inject_state = $$props => {
    		if ("showDriverInfo" in $$props) $$invalidate(0, showDriverInfo = $$props.showDriverInfo);
    		if ("driverInfo" in $$props) $$invalidate(1, driverInfo = $$props.driverInfo);
    		if ("data" in $$props) $$invalidate(2, data$1 = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showDriverInfo, driverInfo, data$1, raceList, onDriverSelect, onBack];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\Footer.svelte generated by Svelte v3.31.1 */

    const file$5 = "src\\Footer.svelte";

    function create_fragment$6(ctx) {
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
    			attr_dev(hr, "class", "svelte-nw5bzq");
    			add_location(hr, file$5, 6, 0, 101);
    			add_location(i, file$5, 7, 23, 130);
    			attr_dev(span, "class", "svelte-nw5bzq");
    			add_location(span, file$5, 7, 53, 160);
    			attr_dev(a, "href", "https://svelte.dev/tutorial");
    			add_location(a, file$5, 7, 80, 187);
    			attr_dev(p, "class", "svelte-nw5bzq");
    			add_location(p, file$5, 7, 0, 107);
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
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
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { year: 0, author: 1, owner: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
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

    /* src\App.svelte generated by Svelte v3.31.1 */
    const file$6 = "src\\App.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let header;
    	let t0;
    	let content;
    	let t1;
    	let footer;
    	let current;

    	header = new Header({
    			props: {
    				longTitle: /*appLongName*/ ctx[0],
    				shortTitle: /*appShortName*/ ctx[1]
    			},
    			$$inline: true
    		});

    	content = new Content({ $$inline: true });

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
    			create_component(content.$$.fragment);
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "svelte-1emi2ig");
    			add_location(main, file$6, 8, 0, 190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(header, main, null);
    			append_dev(main, t0);
    			mount_component(content, main, null);
    			append_dev(main, t1);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};
    			if (dirty & /*appLongName*/ 1) header_changes.longTitle = /*appLongName*/ ctx[0];
    			if (dirty & /*appShortName*/ 2) header_changes.shortTitle = /*appShortName*/ ctx[1];
    			header.$set(header_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			destroy_component(content);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { appLongName } = $$props;
    	let { appShortName } = $$props;
    	const writable_props = ["appLongName", "appShortName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("appLongName" in $$props) $$invalidate(0, appLongName = $$props.appLongName);
    		if ("appShortName" in $$props) $$invalidate(1, appShortName = $$props.appShortName);
    	};

    	$$self.$capture_state = () => ({
    		appLongName,
    		appShortName,
    		Header,
    		Content,
    		Footer
    	});

    	$$self.$inject_state = $$props => {
    		if ("appLongName" in $$props) $$invalidate(0, appLongName = $$props.appLongName);
    		if ("appShortName" in $$props) $$invalidate(1, appShortName = $$props.appShortName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [appLongName, appShortName];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { appLongName: 0, appShortName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*appLongName*/ ctx[0] === undefined && !("appLongName" in props)) {
    			console.warn("<App> was created without expected prop 'appLongName'");
    		}

    		if (/*appShortName*/ ctx[1] === undefined && !("appShortName" in props)) {
    			console.warn("<App> was created without expected prop 'appShortName'");
    		}
    	}

    	get appLongName() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appLongName(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appShortName() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appShortName(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	intro: true,	// This is needed for Svelte Transitions to work at startup
    	props: {
    		appLongName: 'World Kart Championship',
    		appShortName: 'WKC'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
