<?php

//header('Content-Type: text/plain; charset=utf-8');

try {
    
    // Undefined | Multiple Files | $_FILES Corruption Attack
    // If this request falls under any of them, treat it invalid.
    error_log( print_r($_FILES, TRUE) );
    if (
        !isset($_FILES['upfile']['error']) ||
        is_array($_FILES['upfile']['error'])
    ) {
        throw new RuntimeException('Ungültige Parameter.');
    }

    // Check $_FILES['upfile']['error'] value.
    switch ($_FILES['upfile']['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            throw new RuntimeException('Keine Datei mitgegeben.');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new RuntimeException('Datei ist zu groß.');
        default:
            throw new RuntimeException('Unbekannter Fehler.');
    }

    // You should also check filesize here. 
    if ($_FILES['upfile']['size'] > 1000000) {
        throw new RuntimeException('Datei ist zu groß.');
    }

    // DO NOT TRUST $_FILES['upfile']['mime'] VALUE !!
    // Check MIME Type by yourself.
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    if (false === $ext = array_search(
        $finfo->file($_FILES['upfile']['tmp_name']),
        array(
            'jpg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
        ),
        true
    )) {
        throw new RuntimeException('Dateiformat ist nicht erlaubt');
    }

    error_log( print_r($_POST, TRUE) );
    $folder = $_POST["Path"];

    if ($folder === "" ) {
        throw new RuntimeException('Es wurde keine Klassifizierung mitgegeben.');
    }

    $timestamp = time();

    if (!file_exists($folder)) {
        mkdir($folder, 0777, true);
    }

    // You should name it uniquely.
    // DO NOT USE $_FILES['upfile']['name'] WITHOUT ANY VALIDATION !!
    // On this example, obtain safe unique name from its binary data.
    $newPath = sprintf('%s/%s_%s.%s',
    $folder,
    $timestamp,
    sha1_file($_FILES['upfile']['tmp_name']),
    $ext
);
error_log( print_r($newPath, TRUE) );
    if (!move_uploaded_file(
        $_FILES['upfile']['tmp_name'],
        $newPath
    )) {
        throw new RuntimeException('Konnte die hochgeladene Datei nicht verschieben.');
    }

   // echo 'Datei erfolgreich hochgeladen.';
    http_response_code(200);

} catch (RuntimeException $e) {

    echo $e->getMessage();
    http_response_code(501);
}

?>