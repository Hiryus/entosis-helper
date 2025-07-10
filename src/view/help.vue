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
            It recognize the following <em>format</em>:
            <br>
            <span class="code">[system] / [node_id] / [status] / [time_left]</span>
        </p>
        <p>
            Examples:
        </p>
        <ul>
            <li><span class="code">DO6H-Q / Z99 / friendly / 10:00</span></li>
            <li><span class="code">ZAU-JW / P21 / enemy / 0:55</span></li>
            <li><span class="code">1M4-FK / A01 / neutral / none</span></li>
        </ul>
        <p>
            The <span class="code">[system]</span> is obviously the name of the system where the node is located (reminder: all nodes spawn in the same constellation).
        </p>
        <p>
            <span class="code">[node_id]</span> is the <em>node identifier</em> appearing in the last part of a command node name. It helps differentiating several nodes in a same system.
            <br>
            To be clear, all nodes are named with the following convention:
            <br><span class="code">[system] Infrastructure Hub Command Node [node_id]</span>, where <span class="code">[system]</span> is the name of the system for which the entosis event is running (⚠️ it is <u>not</u> the node id) and the very last part of the name is the actual node id. It always starts with a letter followed by two digits for a total of three characters.
            <br>
            So, for example, in the name <span class="code">ZAU-JW Infrastructure Hub Command Node B58</span>, the node id is <span class="code">B58</span>.
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
            Note that "new", "neutral" and "unknown" are considered the same and are shown as "neutral". You can use either keyword as you prefer.
        </p>
        <p>
            <span class="code">[time_left]</span> is the <em>remaining time</em> before entosis finishes.
            <br>
            It must follow a strict format for the time: <span class="code">[minutes]:[seconds]</span>.
        </p>
        <ul>
            <li>... but you can also use the <span class="code">warmup</span> keyword instead of a timer.</li>
            <li>... or the <span class="code">done</span> keyword to indicate the node is gone.</li>
            <li>... and for neutral nodes, you can use the <span class="code">none</span> keyword (or any valid format actually - there is no timer for neutral nodes anyway).</li>
        </ul>

        <h3>Tips and tricks</h3>
        <p>
            I highly recommand you to <em>drag and drop</em> system name instead of writting it manually.
            Even if the application tries to infer your input in case of typo, it is not really reliable.
            Drag and drop will be faster than wrtting the full name anyway.
        </p>
        <p>
            The tool selects the last fleet file by default.
            If you have <em>several characters</em> logged-in in different fleets, make sure to double-check as Murphy law says that you will never get the right one !
        </p>
        <p>
            You can <em>click on a system</em> name to show or hide nodes details.
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
