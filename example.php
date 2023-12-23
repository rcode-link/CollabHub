<?php


// Mocked calendar data (replace with your actual data)
$calendars = [
    'calendar1' => [
        'displayname' => 'My Calendar 1',
        'uri' => 'calendar1',
    ],
    'calendar2' => [
        'displayname' => 'My Calendar 2',
        'uri' => 'calendar2',
    ],
];

// Handle PROPFIND request to list calendars
$xml = <<<XML
<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
</D:multistatus>
XML;

$dom = new DOMDocument();
$dom->loadXML($xml);

foreach ($calendars as $calendar) {
    $response = $dom->createElement('D:response');

    // Add HREF element
    $href = $dom->createElement('D:href',  'my-url/' . $calendar['uri']);
    $response->appendChild($href);

    // Add displayname element
    $displayname = $dom->createElement('D:displayname', $calendar['displayname']);
    $response->appendChild($displayname);

    $dom->documentElement->appendChild($response);
}

echo $dom->saveXML();
exit;
