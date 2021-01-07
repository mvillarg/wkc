<script>
    export let text;
    let currentText = text;

    function typewriter(node, { speed = 50 }) {
        const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

        if (valid == false) {
            throw new Error(`This transition only works on elements with a single text node child`);
        }

        const text = node.textContent;
        const duration = text.length * speed;

        return {
            duration,
            tick: (t) => {
                const i = ~~(text.length * t);
                node.textContent = text.slice(0, i);
            }
        };
    }

    function updateText() {
        currentText = text;
    }
</script>


{#if text === currentText}
<h3 in:typewriter>{text}</h3>
{:else}
{updateText()}
{/if}


<style>
    h3 {
        color: var(--brand-primary-color);
        padding-left: 1em;
        font-style: italic;
        /*text-shadow: -1px 0.5px 1px rgb(109, 109, 109);*/
    }
</style>