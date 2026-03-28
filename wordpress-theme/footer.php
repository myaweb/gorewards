    </div><!-- .wrap -->
</main>

<footer>
    <div class="wrap">
        <div class="footer-grid">
            <div class="footer-brand">
                <div class="footer-brand-logo">
                    <div class="logo-icon" style="width:28px;height:28px;font-size:.8rem">💳</div>
                    <span class="logo-text"><?php bloginfo('name'); ?></span>
                </div>
                <p><?php bloginfo('description'); ?></p>
            </div>
            <div class="footer-col">
                <h5><?php _e('Product', 'creditrich'); ?></h5>
                <ul>
                    <li><a href="https://creditrich.net/sign-up" target="_blank" rel="noopener">Get Started</a></li>
                    <li><a href="https://creditrich.net/#calculator" target="_blank" rel="noopener">Calculator</a></li>
                    <li><a href="https://creditrich.net/compare" target="_blank" rel="noopener">Compare Cards</a></li>
                    <li><a href="https://creditrich.net/cards" target="_blank" rel="noopener">All Cards</a></li>
                </ul>
            </div>
            <div class="footer-col">
                <h5><?php _e('Blog', 'creditrich'); ?></h5>
                <?php wp_nav_menu([
                    'theme_location' => 'footer',
                    'container'      => false,
                    'fallback_cb'    => false,
                    'depth'          => 1,
                ]); ?>
            </div>
            <div class="footer-col">
                <h5><?php _e('Company', 'creditrich'); ?></h5>
                <ul>
                    <li><a href="https://creditrich.net/privacy" target="_blank" rel="noopener">Privacy Policy</a></li>
                    <li><a href="https://creditrich.net/terms" target="_blank" rel="noopener">Terms of Service</a></li>
                    <li><a href="mailto:support@creditrich.net">support@creditrich.net</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom">
            <span>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</span>
            <div class="footer-bottom-links">
                <a href="https://creditrich.net/privacy" target="_blank" rel="noopener">Privacy</a>
                <a href="https://creditrich.net/terms" target="_blank" rel="noopener">Terms</a>
                <a href="<?php echo esc_url(get_bloginfo('url')); ?>/sitemap.xml">Sitemap</a>
            </div>
        </div>

        <div class="footer-disclaimer">
            We are an independent publisher. We may earn a commission when you apply for products through our links.
            Information is for general purposes only and does not constitute financial advice.
            Please verify current offers on the issuer's website before applying.
        </div>
    </div>
</footer>

</div><!-- .site-wrapper -->
<?php wp_footer(); ?>
</body>
</html>
