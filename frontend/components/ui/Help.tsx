export default function Help () {

    const workflowSteps = [
        {
            step: '1',
            label: 'Define your plots',
            desc: 'Draw them manually or upload GeoJSON / .shp files'
        },
        {
            step: '2',
            label: 'Run analysis',
            desc: 'Each feature is processed for its own season window.'
        },
        {
            step: '3',
            label: 'Read & export',
            desc: 'Inspect per-plot results, then export to CSV or GeoJSON'
        }
    ]

    return <div className="[&_h3]:font-semibold *:text-sm *:text-justify">

       <section>
        <h3>1 &middot; Workflow at a glance</h3>
        <div className="flex gap-4 my-2">
          {workflowSteps.map(flow => 
          <div className="border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left">
            <p className="uppercase font-semibold mb-1">Step {flow.step}</p>
            <p className="mb-2 font-semibold">{flow.label}</p>
            <p>{flow.desc}</p>
          </div>)}
        </div>
      </section>

      <section className="my-4 leading-relaxed">
        <h3>2 &middot; Creating plots manually</h3>
        <p>Choose <b>Point</b> or <b>Polygon</b> in the left panel and press the draw button &mdash;
          you draw the geometry first, then fill in its attributes.</p>
        <ul className="list-disc ml-8 mt-4">
          <li><b>Point</b> &mdash; one click on the map places the plot.</li>
          <li><b>Polygon</b> &mdash; click to add vertices (minimum three), then press
            <b>Finish polygon</b>. <b>Esc</b> cancels at any time.</li>
          <li>As soon as the geometry is complete the <b>Plot attributes</b> dialog opens: enter
            ID, plot name, season dates and (for points) the plot number, then press
            <b>Add plot</b>. <b>Discard</b> throws the geometry away.</li>
        </ul>
      </section>
      <section className="my-4">
        <h3>3 &middot; Attributes and validation</h3>
        <p>Every plot must carry the attributes the model needs. Features are rejected with a
          message in the panel until all rules pass.</p>
        <table className="mt-4 [&_th]:uppercase [&_th]:font-normal w-full">
          <thead><tr><th>Attribute</th><th>Rule</th></tr></thead>
          <tbody className="[&_td]:first:font-semibold [&_td]:pr-12 [&_tr]:border-t [&_tr]:last:border-b [&_td]:py-1.5 [&_tr]:border-slate-300">
            <tr><td>ID</td><td>Positive integer, unique across your plots. Auto-increments after each add.</td></tr>
            <tr><td>Name</td><td>Required. The plot label used in lists, popups and exports.</td></tr>
            <tr><td>SOS / EOS</td><td>Both required; EOS must fall after SOS. Defines the season the WaPOR data is summed over.</td></tr>
            <tr><td>Location</td><td>Points only &mdash; the plot number recorded in the field.</td></tr>
            <tr><td>Geometry</td><td>Polygons need at least three vertices; coordinates must be geographic (EPSG:4326).</td></tr>
          </tbody>
        </table>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>4 &middot; Uploading existing plots</h3>
        <p>Use <b>Upload GeoJSON or Shapefile</b> for plots you already have. Accepted geometries:
          Point, MultiPoint, Polygon, MultiPolygon &mdash; multi-part features are split into
          individual plots.</p>
        <ul className="list-disc ml-8  mt-4">
          <li>Coordinates must be longitude/latitude in <b>EPSG:4326</b>; projected files should be
            reprojected first.</li>
          <li>Plot names come from a <code>name</code>, <code>plot</code> or <code>field</code>
            property in the GeoJSON, or from the <code>Name</code> column of a shapefile&rsquo;s
            <code>.dbf</code>. Without either, plots are numbered by position
            (<code>Plot 1</code>, <code>Plot 2</code>, &hellip;) &mdash; naming them after the
            file would give every feature in one upload the same label.</li>
          <li>For shapefiles, select the <code>.shp</code> and its <code>.dbf</code> together
            &mdash; Name, ID, Location and SOS/EOS columns are then read from the attribute
            table. Without the <code>.dbf</code> only geometry is imported and the form&rsquo;s
            dates apply.</li>
          <li>Unsupported geometries (lines, empty features) are skipped and counted in the
            message.</li>
        </ul>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>5 &middot; Running the analysis</h3>
        <p>Press <b>Run analysis</b>. Features are processed one by one &mdash; the progress card
          reports the count and each feature&rsquo;s ID, yield and CWP as it completes, then the
          map, KPI cards and legend switch to results.</p>
        <p>Add or remove plots and press <b>Re-run analysis</b> to refresh. Results always reflect
          the plots currently in the panel.</p>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>6 &middot; Reading the results</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>WP (kg/m&sup3;)</b><p>Crop water productivity &mdash; grain yield per cubic metre of water consumed.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>Yield (t/ha)</b><p>Grain yield from seasonal NPP via the etwapor biomass model.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>AETI (mm)</b><p>Actual evapotranspiration and interception summed over the season.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"> <b>NPP &middot; LGP</b><p>Seasonal net primary production, and length of growing period in days.</p></div>
        </div>
        <p>The map colours plots along the legend ramp &mdash; darker greens
          are higher values. The map is coloured by water productivity; switch the basemap with the
          control at the top right. Click any plot on the map or in the list to open its detail.</p>
      </section>
      <section  className="my-4 leading-relaxed">
        <h3>7 &middot; Exporting</h3>
        <p>Use <b>Compare with field data</b> to type measured yield and water productivity per
          plot. Differences are shown per plot (green within 10%, amber to 25%, red beyond), with
          the number of pairs, the mean bias and the RMSE across them.</p>
        <p>After a run, <b>Export results (CSV)</b> writes one row per plot with its attributes and
          all computed metrics &mdash; ready for further analysis or reporting.</p>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>8 &middot; Troubleshooting</h3>
        <ul className="list-disc ml-8  mt-4">
          <li><b>Nothing appears after a click</b> &mdash; the draw button must be active; check the panel message for a validation error.</li>
          <li><b>&ldquo;ID already used&rdquo;</b> &mdash; raise the ID; each plot needs its own.</li>
          <li><b>Upload adds nothing</b> &mdash; the file has no supported geometry, or coordinates are projected rather than lon/lat.</li>
          <li><b>Plots are grey and no legend shows</b> &mdash; the analysis has not been run yet.</li>
        </ul>
      </section>
      <p className="text-xs text-slate-600 pt-3 border-t border-t-slate-200">The 2026 survey fields and monitoring points carry real
        <code>etwapor</code> results and can be opened at any time. Areas you add yourself get
        illustrative estimates, labelled as such, until the tool is connected to a live WaPOR
        retrieval. See <b>Method &amp; data</b> for the equations and the caveats.</p>

    </div>

}