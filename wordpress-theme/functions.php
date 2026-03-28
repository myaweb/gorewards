<?php
/**
 * CreditRich Theme Functions
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'CREDITRICH_VERSION', '1.0.0' );

/* ── Theme setup ──────────────────────────────────────────────────────── */
function creditrich_setup() {
    load_theme_textdomain( 'creditrich', get_template_directory() . '/languages' );

    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'html5', [ 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' ] );
    add_theme_support( 'custom-logo', [
        'height'      => 50,
        'width'       => 200,
        'flex-width'  => true,
        'flex-height' => true,
    ] );

    // Image sizes
    add_image_size( 'creditrich-card',  800, 450, true );
    add_image_size( 'creditrich-hero', 1200, 630, true );

    // Menus
    register_nav_menus( [
        'primary' => __( 'Primary Menu', 'creditrich' ),
        'footer'  => __( 'Footer Menu', 'creditrich' ),
    ] );
}
add_action( 'after_setup_theme', 'creditrich_setup' );

/* ── Enqueue assets ───────────────────────────────────────────────────── */
function creditrich_enqueue() {
    // Google Fonts — Inter + Playfair Display
    wp_enqueue_style(
        'creditrich-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap',
        [],
        null
    );

    // Main CSS — use style.css (WordPress always finds this)
    wp_enqueue_style(
        'creditrich-main',
        get_stylesheet_uri(),
        [ 'creditrich-fonts' ],
        CREDITRICH_VERSION
    );

    // Main JS
    wp_enqueue_script(
        'creditrich-main',
        get_template_directory_uri() . '/assets/js/main.js',
        [],
        CREDITRICH_VERSION,
        true
    );

    // Comment reply
    if ( is_singular() && comments_open() ) {
        wp_enqueue_script( 'comment-reply' );
    }
}
add_action( 'wp_enqueue_scripts', 'creditrich_enqueue' );

/* ── Widgets ──────────────────────────────────────────────────────────── */
function creditrich_widgets_init() {
    register_sidebar( [
        'name'          => __( 'Blog Sidebar', 'creditrich' ),
        'id'            => 'sidebar-1',
        'before_widget' => '<div class="widget">',
        'after_widget'  => '</div>',
        'before_title'  => '<h3 class="widget-title">',
        'after_title'   => '</h3>',
    ] );
}
add_action( 'widgets_init', 'creditrich_widgets_init' );

/* ── Excerpt length ───────────────────────────────────────────────────── */
function creditrich_excerpt_length() { return 25; }
add_filter( 'excerpt_length', 'creditrich_excerpt_length' );

function creditrich_excerpt_more() { return '…'; }
add_filter( 'excerpt_more', 'creditrich_excerpt_more' );

/* ── Reading time ─────────────────────────────────────────────────────── */
function creditrich_reading_time( $post_id = null ) {
    $content    = get_post_field( 'post_content', $post_id ?: get_the_ID() );
    $word_count = str_word_count( strip_tags( $content ) );
    $minutes    = max( 1, (int) ceil( $word_count / 200 ) );
    return $minutes . ' min read';
}

/* ── Custom comment form ──────────────────────────────────────────────── */
function creditrich_comment_form_defaults( $defaults ) {
    $defaults['class_form']   = 'comment-form';
    $defaults['class_submit'] = 'btn btn-primary';
    return $defaults;
}
add_filter( 'comment_form_defaults', 'creditrich_comment_form_defaults' );

/* ── Body classes ─────────────────────────────────────────────────────── */
function creditrich_body_classes( $classes ) {
    if ( is_singular() ) $classes[] = 'single-post-view';
    if ( is_archive() || is_home() ) $classes[] = 'archive-view';
    return $classes;
}
add_filter( 'body_class', 'creditrich_body_classes' );

/* ── Disable emoji (performance) ─────────────────────────────────────── */
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
