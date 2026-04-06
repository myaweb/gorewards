<?php get_header(); ?>

<div class="error-404">
    <div class="error-code">404</div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="btn btn-primary">← Back to Blog</a>
</div>

<?php get_footer(); ?>
