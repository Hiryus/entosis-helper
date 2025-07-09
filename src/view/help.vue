<template>
    <div class="help">
        <h2 id="help">Help</h2>

        <h3>Description</h3>
        <p>
            This tool analyzes chat logs and looks for entosis reports with dedicated format.
            <br>
            It then shows a synthetic view of on-going entosis.
        </p>
        <p>
            By default, the tool parses <em>fleet chat</em> (it needs to be started <em>after</em> the fleet creation or it will load last fleet logs !).
            You can also use another file by clicking the "↺" button (top left corner of the window).
        </p>

        <h3>Commands</h3>
        <p>
            It recognize the following <em>format</em> :
            <span class="code">[system_name] / [node_id] / [status] / [time_left]</span>
            <br>
            Example : <span class="code">DO6H-Q / Z99 / friendly / 0:55</span>
        </p>
        <p>
            <span class="code">[status]</span> can be one of the following values :
        </p>
        <ul>
            <li><span class="code">new</span> - node just spawned,</li>
            <li><span class="code">friendly</span> - an ally is entosissing,</li>
            <li><span class="code">enemy</span> - an enemy is entosissing,</li>
            <li><span class="code">neutral</span> - nobody is entosissing,</li>
            <li><span class="code">unknown</span> - you don't know if someone is entosissing.</li>
        </ul>
        <p>
            Note that "new", "neutral" and "unknown" are considered the same and are shown as "neutral". You can use either command as you prefer.
        </p>
        <p>
            <span class="code">[time_left]</span> must follow a strict format : <span class="code">[minutes]:[seconds]</span>.
        </p>
        <ul>
            <li>... but you can also use the <span class="code">warmup</span> keyword instead of a timer.</li>
            <li>... or the <span class="code">done</span> keyword to indicate the node is gone.</li>
        </ul>

        <h3>Tips and tricks</h3>
        <p>
            You can <em>click on a system</em> name to show or hide nodes details.
        </p>
        <p>
            The tool selects the last fleet file by default.
            If you have <em>several characters</em> logged-in in different fleets, make sure to double-check as Murphy law says that you will never get the right one !
        </p>
        <p>
            I highly recommand you to <em>drag and drop</em> system name instead of writting it manually.
            Even if the application tries to infer your input in case of typo, it is not really reliable.
            Drag and drop will be faster than wrtting the full name anyway.
        </p>
        <p>
            Commands are <em>not</em> case sensitive.
        </p>
        <p>
            You can show or hide this help by clicking on the "<em>?</em>" button.
        </p>
    </div>
</template>

<style>
    .code {
        font-family: Consolas, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New;
        background-color: #DDD;
    }
</style>
