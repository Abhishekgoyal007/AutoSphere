/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers(){
        return [
            {
                source:"/embed",
                headers:[
                    {
                        key: "Content-Security-Policy",
                        value: "frame-src 'self' https://71672e44-ddd6-4bd5-806f-22fbe60d1761.created.app/; "
                    },
                ]
            }
        ]
    }
};

export default nextConfig;
