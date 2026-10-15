import { Import, MapPin, VectorPolygon } from "lucide-react"

export default function Help () {

    const workflowSteps = [
        {
            step: '1',
            label: 'Define your plots',
            desc: 'Draw them manually or upload GeoJSON / .shp file'
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
        <h3>1. Workflow at a glance</h3>
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
        <h3>2. Creating plots manually</h3>
        <p>Click <b><MapPin size={16} className="inline-block"/></b> to draw a point or <b><VectorPolygon size={16} className="inline-block"/></b> to draw a polygon using the map tools &mdash;
          you draw the geometry first, then fill in its attributes.</p>
        <ul className="list-disc ml-8 mt-4">
          <li><b>Point</b> &mdash; one click on the map places the plot.</li>
          <li><b>Polygon</b> &mdash; Click on the map to add vertices. To finish the polygon, click the first point or add at least three vertices and click <span className="map-tool-inherit">Finish</span>. Click <span  className="map-tool-inherit">Cancel</span> at any time to cancel drawing.</li>
          <li>As soon as the geometry is complete the <b>Plot attributes</b> dialog opens: enter
            ID, plot name, season dates and (for points) the plot number, then press <b>Add plot</b>. <b>Discard</b> throws the geometry away.</li>
        </ul>
      </section>
      <section className="my-4">
        <h3>3. Attributes and validation</h3>
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
        <h3>4. Uploading existing plots</h3>
        <p>Click <b><Import size={16} className="inline-block" /></b> to upload .zip shapefile or .geojson file for plots you already have. Accepted geometries:
          Point, MultiPoint, Polygon, MultiPolygon &mdash; multi-part features are split into
          individual plots.</p>
        <ul className="list-disc ml-8  mt-4">
          <li>Coordinates must be longitude/latitude in <b>EPSG:4326</b>; projected files should be
            reprojected first.</li>
          <li>For shapefiles, &mdash; Name, ID, Location and SOS/EOS columns are then read from the attribute table.</li>
          <li>For GeoJSON, &mdash; Name, ID, Location and SOS/EOS columns are then read from the properties attribute</li>
          <li>Unsupported geometries (lines, empty features) are skipped and counted in the
            message.</li>
        </ul>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>5. Running the analysis</h3>
        <p>Press <b>Run analysis</b>. Features are processed one by one &mdash; the progress card
          reports the count and each feature&rsquo;s ID, yield and CWP as it completes, then the
          map, KPI cards and legend switch to results.</p>
        <p>Add or remove plots and press <b>Re-run analysis</b> to refresh. Results always reflect
          the plots currently in the panel.</p>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>6. Reading the results</h3>
        <div className="flex gap-4 flex-wrap">
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>WP (kg/m&sup3;)</b><p>Crop water productivity &mdash; grain yield per cubic metre of water consumed.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>Yield (t/ha)</b><p>Grain yield from seasonal NPP via the etwapor biomass model.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"><b>AETI (mm)</b><p>Actual evapotranspiration and interception summed over the season.</p></div>
          <div className="w-[49%] border rounded border-slate-200 shadow-xs flex flex-col p-3 *:text-left"> <b>NPP &middot; LGP</b><p>Seasonal net primary production, and length of growing period in days.</p></div>
        </div>
        <p>Switch the basemap with the control at the bottom left. Click any plot on the map or in the list to open its detail.</p>
      </section>
      <section  className="my-4 leading-relaxed">
        <h3>7. Exporting</h3>
        <p>After a run, Clicking <b>Export CSV</b> writes one row per plot with its attributes and
          all computed metrics or Clicking <b>Export GeoJSON</b> writes a FeatureCollection one Feature per plot with its attributes and
          all computed metrics &mdash; ready for further analysis or reporting.</p>
      </section>
      <section className="my-4 leading-relaxed">
        <h3>8. Troubleshooting</h3>
        <ul className="list-disc ml-8  mt-4">
          <li><b>Nothing appears after a click</b> &mdash; the draw button must be active; check the panel message for a validation error.</li>
          <li><b>&ldquo;ID already used&rdquo;</b> &mdash; raise the ID; each plot needs its own.</li>
          <li><b>Upload adds nothing</b> &mdash; the file has no supported geometry, or coordinates are projected rather than lon/lat.</li>
        </ul>
      </section>
      <p className="text-xs text-slate-600 pt-3 border-t border-t-slate-200">See <b>Method &amp; data</b> for the equations and the caveats.</p>

    </div>

}