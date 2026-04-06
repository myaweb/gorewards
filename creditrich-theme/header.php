<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- Ambient background -->
<div class="ambient" aria-hidden="true">
    <div class="ambient-orb orb1"></div>
    <div class="ambient-orb orb2"></div>
    <div class="ambient-orb orb3"></div>
</div>

<!-- Reading progress bar (single posts only) -->
<?php if (is_single()) : ?>
    <div id="progress-bar" aria-hidden="true"></div>
<?php endif; ?>

<div class="site-wrapper">

<!-- NAV -->
<nav>
    <div class="nav-bar">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="logo">
            <?php if (has_custom_logo()) :
                the_custom_logo();
            else : ?>
                <div class="logo-icon">💳</div>
                <span class="logo-text"><?php bloginfo('name'); ?></span>
            <?php endif; ?>
        </a>

        <?php wp_nav_menu([
            'theme_location' => 'primary',
            'menu_class'     => 'nav-links',
            'container'      => false,
            'fallback_cb'    => false,
            'depth'          => 1,
        ]); ?>

        <div class="nav-right">
            <a href="https://GoRewards.net" class="btn-ghost" target="_blank" rel="noopener">App</a>
            <a href="https://GoRewards.net/sign-up" class="btn-cta" target="_blank" rel="noopener">Try Free →</a>
        </div>

        <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
    </div>
</nav>

<main class="site-main">
    <div class="wrap">
