<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CalDAVController extends Controller
{
    // Base path for storing calendar data
    protected $storagePath = 'calendar';

    /**
     * Handle PROPFIND requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function propfind(Request $request)
    {
        $body = $request->getContent();
        $depth = $request->header('Depth', '0');

        Log::info("PROPFIND request body: " . $body);

        $response = '<?xml version="1.0" encoding="utf-8" ?>
            <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
                <D:response>
                    <D:href>/cal/calendar/</D:href>
                    <D:propstat>
                        <D:prop>
                            <D:resourcetype>
                                <D:collection/>
                                <C:calendar/>
                            </D:resourcetype>
                            <D:displayname>Calendar</D:displayname>
                            <C:supported-calendar-component-set>
                                <C:comp name="VEVENT"/>
                                <C:comp name="VTODO"/>
                            </C:supported-calendar-component-set>
                            <C:calendar-description>My Calendar</C:calendar-description>
                            <C:calendar-timezone><![CDATA[BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VTIMEZONE
TZID:UTC
END:VTIMEZONE
END:VCALENDAR]]></C:calendar-timezone>
                            <CS:getctag>http://sabre.io/ns/sync/1</CS:getctag>
                            <D:sync-token>http://sabre.io/ns/sync/1</D:sync-token>
                            <D:current-user-principal>
                                <D:href>/cal/principals/user1/</D:href>
                            </D:current-user-principal>
                            <D:owner>
                                <D:href>/cal/principals/user1/</D:href>
                            </D:owner>
                            <D:supported-report-set>
                                <D:supported-report>
                                    <D:report><C:calendar-query/></D:report>
                                </D:supported-report>
                                <D:supported-report>
                                    <D:report><C:calendar-multiget/></D:report>
                                </D:supported-report>
                            </D:supported-report-set>
                        </D:prop>
                        <D:status>HTTP/1.1 200 OK</D:status>
                    </D:propstat>
                </D:response>';

        if ($depth !== '0') {
            $files = Storage::files($this->storagePath);
            foreach ($files as $file) {
                $path = str_replace('calendar/', '', $file);
                $lastModified = Storage::lastModified($file);
                $size = Storage::size($file);
                $etag = md5($lastModified . $size);

                $response .= '
                    <D:response>
                        <D:href>/cal/calendar/' . htmlspecialchars($path) . '</D:href>
                        <D:propstat>
                            <D:prop>
                                <D:getcontenttype>text/calendar</D:getcontenttype>
                                <D:resourcetype/>
                                <D:getlastmodified>' . date('r', $lastModified) . '</D:getlastmodified>
                                <D:getetag>"' . $etag . '"</D:getetag>
                                <D:getcontentlength>' . $size . '</D:getcontentlength>
                                <C:calendar-data>' . htmlspecialchars(Storage::get($file)) . '</C:calendar-data>
                            </D:prop>
                            <D:status>HTTP/1.1 200 OK</D:status>
                        </D:propstat>
                    </D:response>';
            }
        }

        $response .= '</D:multistatus>';

        return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    /**
     * Handle GET requests.
     *
     * @param  string|null  $path
     * @return \Illuminate\Http\Response
     */
    public function get($path)
    {
        if (empty($path)) {
            $response = '<?xml version="1.0" encoding="utf-8" ?>
                <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
                    <D:response>
                        <D:href>/cal/calendar/</D:href>
                        <D:propstat>
                            <D:prop>
                                <D:resourcetype>
                                    <D:collection/>
                                    <C:calendar/>
                                </D:resourcetype>
                                <D:displayname>Calendar</D:displayname>
                                <C:supported-calendar-component-set>
                                    <C:comp name="VEVENT"/>
                                    <C:comp name="VTODO"/>
                                </C:supported-calendar-component-set>
                                <C:calendar-description>My Calendar</C:calendar-description>
                                <C:calendar-timezone><![CDATA[BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VTIMEZONE
TZID:UTC
END:VTIMEZONE
END:VCALENDAR]]></C:calendar-timezone>
                                <CS:getctag>http://sabre.io/ns/sync/1</CS:getctag>
                                <D:sync-token>http://sabre.io/ns/sync/1</D:sync-token>
                                <D:current-user-principal>
                                    <D:href>/cal/principals/user1/</D:href>
                                </D:current-user-principal>
                            </D:prop>
                            <D:status>HTTP/1.1 200 OK</D:status>
                        </D:propstat>
                    </D:response>
                </D:multistatus>';

            return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
        }

        if (Storage::exists($this->storagePath . '/' . $path)) {
            $content = Storage::get($this->storagePath . '/' . $path);
            return response($content, 200, ['Content-Type' => 'text/calendar']);
        }

        return response('', 404);
    }

    /**
     * Handle PUT requests (create/update calendar objects).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $path
     * @return \Illuminate\Http\Response
     */
    public function put(Request $request, $path)
    {
        $content = $request->getContent();

        // Validate that the content is a valid iCalendar object
        // In a real implementation, you'd want to validate the iCalendar data here

        Storage::put($this->storagePath . '/' . $path, $content);

        return response('', 201); // 201 Created
    }

    /**
     * Handle DELETE requests (remove calendar objects).
     *
     * @param  string  $path
     * @return \Illuminate\Http\Response
     */
    public function delete($path)
    {
        if (Storage::exists($this->storagePath . '/' . $path)) {
            Storage::delete($this->storagePath . '/' . $path);
            return response('', 204); // 204 No Content
        }

        return response('', 404);
    }

    /**
     * Handle REPORT requests (calendar-specific queries).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|null  $path
     * @return \Illuminate\Http\Response
     */
    public function report(Request $request, $path = null)
    {
        $body = $request->getContent();
        Log::info("REPORT request body: " . $body);

        // Simplified response - in a real implementation, parse the XML request
        // and return calendar data based on the query
        $response = '<?xml version="1.0" encoding="utf-8" ?>
            <C:calendar-query xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:D="DAV:">
                <D:response>
                    <D:href>/cal/calendar/event1.ics</D:href>
                    <D:propstat>
                        <D:prop>
                            <C:calendar-data>BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Client//EN
BEGIN:VEVENT
UID:12345
DTSTAMP:20230101T000000Z
DTSTART:20230101T100000Z
DTEND:20230101T110000Z
SUMMARY:Example Event
END:VEVENT
END:VCALENDAR</C:calendar-data>
                        </D:prop>
                        <D:status>HTTP/1.1 200 OK</D:status>
                    </D:propstat>
                </D:response>
            </C:calendar-query>';

        return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    /**
     * Handle MKCOL requests (create calendar collections).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $path
     * @return \Illuminate\Http\Response
     */
    public function mkcol(Request $request, $path)
    {
        Storage::makeDirectory($this->storagePath . '/' . $path);
        return response('', 201); // 201 Created
    }

    /**
     * Handle HEAD requests.
     *
     * @param  string|null  $path
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function head($path, Request $request)
    {
        $headers = [
            'DAV' => '1, 2, 3, calendar-access, addressbook, extended-mkcol',
            'Allow' => 'OPTIONS, GET, HEAD, POST, DELETE, PROPFIND, PROPPATCH, COPY, MOVE, REPORT, MKCOL',
            'Accept-Post' => 'text/calendar, application/calendar+json',
            'Content-Length' => '0'
        ];

        if (empty($path)) {
            $headers['Content-Type'] = 'application/xml; charset=utf-8';
        } else {
            $filePath = $this->storagePath . '/' . $path;
            if (Storage::exists($filePath)) {
                $headers['Content-Type'] = 'text/calendar';
                $headers['Last-Modified'] = date('r', Storage::lastModified($filePath));
                $headers['ETag'] = '"' . md5(Storage::lastModified($filePath) . Storage::size($filePath)) . '"';
            }
        }

        if (empty($path) || Storage::exists($this->storagePath . '/' . $path)) {
            return response('', 200, $headers);
        }

        return response('', 404, $headers);
    }

    /**
     * Handle OPTIONS requests.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function options(Request $request)
    {
        return response('', 200, [
            'DAV' => '1, 2, 3, calendar-access, addressbook, extended-mkcol',
            'Allow' => 'OPTIONS, GET, HEAD, POST, DELETE, PROPFIND, PROPPATCH, COPY, MOVE, REPORT, MKCOL',
            'Content-Length' => '0'
        ]);
    }

    /**
     * Handle PROPFIND requests for principal resources.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function principalPropfind(Request $request)
    {
        $response = '<?xml version="1.0" encoding="utf-8" ?>
            <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav" xmlns:CS="http://calendarserver.org/ns/">
                <D:response>
                    <D:href>/cal/principals/user1/</D:href>
                    <D:propstat>
                        <D:prop>
                            <D:resourcetype>
                                <D:principal/>
                            </D:resourcetype>
                            <D:displayname>User 1</D:displayname>
                            <D:current-user-principal>
                                <D:href>/cal/principals/user1/</D:href>
                            </D:current-user-principal>
                            <C:calendar-home-set>
                                <D:href>/cal/calendar/</D:href>
                            </C:calendar-home-set>
                            <C:calendar-user-address-set>
                                <D:href>mailto:user1@example.com</D:href>
                            </C:calendar-user-address-set>
                        </D:prop>
                        <D:status>HTTP/1.1 200 OK</D:status>
                    </D:propstat>
                </D:response>
            </D:multistatus>';

        return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }

    /**
     * Handle GET requests for principal resources.
     *
     * @param  string|null  $path
     * @return \Illuminate\Http\Response
     */
    public function principalGet($path)
    {
        $response = '<?xml version="1.0" encoding="utf-8" ?>
            <D:multistatus xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
                <D:response>
                    <D:href>/cal/principals/' . ($path ?: 'user1') . '/</D:href>
                    <D:propstat>
                        <D:prop>
                            <D:resourcetype>
                                <D:principal/>
                            </D:resourcetype>
                            <D:displayname>User</D:displayname>
                            <C:calendar-home-set>
                                <D:href>/cal/calendar/</D:href>
                            </C:calendar-home-set>
                            <C:calendar-user-address-set>
                                <D:href>mailto:user1@example.com</D:href>
                            </C:calendar-user-address-set>
                        </D:prop>
                        <D:status>HTTP/1.1 200 OK</D:status>
                    </D:propstat>
                </D:response>
            </D:multistatus>';

        return response($response, 200, ['Content-Type' => 'application/xml; charset=utf-8']);
    }
}
