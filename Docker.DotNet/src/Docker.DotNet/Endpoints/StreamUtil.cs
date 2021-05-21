using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Docker.DotNet.Models
{
    internal static class StreamUtil
    {
        internal static async Task MonitorStreamAsync(Task<Stream> streamTask, DockerClient client, CancellationToken cancel, IProgress<string> progress)
        {
            using (var stream = await streamTask)
            {
                // ReadLineAsync must be cancelled by closing the whole stream.
                using (cancel.Register(() => stream.Dispose()))
                {
                    using (var reader = new StreamReader(stream, new UTF8Encoding(false)))
                    {
                        string line;
                        while ((line = await reader.ReadLineAsync()) != null)
                        {
                            progress.Report(line);
                        }
                    }
                }
            }
        }

        internal static async Task MonitorStreamForMessagesAsync<T>(Task<Stream> streamTask, DockerClient client, CancellationToken cancel, IProgress<T> progress)
        {
            using (var stream = await streamTask)
            {
                // ReadLineAsync must be cancelled by closing the whole stream.
                using (cancel.Register(() => stream.Dispose()))
                {
                    var startObjectCount = 0;
                    using (var reader = new StreamReader(stream, new UTF8Encoding(false)))
                    {
                        try
                        {
                            var ch = new char[1];
                            var sb = new StringBuilder();
                            while (await reader.ReadAsync(ch, 0, 1).ConfigureAwait(false) == 1)
                            {
                                sb.Append(ch[0]);
                                switch (ch[0])
                                {
                                    case '}':
                                        {
                                            startObjectCount--;
                                            if (startObjectCount == 0)
                                            {
                                                var prog = client.JsonSerializer.DeserializeObject<T>(sb.ToString());
                                                if (prog == null) continue;
                                                progress.Report(prog);
                                                sb.Clear();
                                            }
                                            break;
                                        }
                                    case '{':
                                        startObjectCount++;
                                        break;
                                }
                            }
                        }
                        catch (ObjectDisposedException)
                        {
                            // The subsequent call to reader.ReadLineAsync() after cancellation
                            // will fail because we disposed the stream. Just ignore here.
                        }
                    }
                }
            }
            //using (var stream = await streamTask)
            //{
            //    // ReadLineAsync must be cancelled by closing the whole stream.
            //    using (cancel.Register(() => stream.Dispose()))
            //    {
            //        using (var reader = new StreamReader(stream, new UTF8Encoding(false)))
            //        {
            //            string line;
            //            try
            //            {
            //                while ((line = await reader.ReadLineAsync()) != null)
            //                {
            //                    var prog = client.JsonSerializer.DeserializeObject<T>(line);
            //                    if (prog == null) continue;

            //                    progress.Report(prog);
            //                }
            //            }
            //            catch (ObjectDisposedException)
            //            {
            //                // The subsequent call to reader.ReadLineAsync() after cancellation
            //                // will fail because we disposed the stream. Just ignore here.
            //            }
            //        }
            //    }
            //}
        }

        internal static async Task MonitorResponseForMessagesAsync<T>(Task<HttpResponseMessage> responseTask, DockerClient client, CancellationToken cancel, IProgress<T> progress)
        {
            using (var response = await responseTask)
            {
                await client.HandleIfErrorResponseAsync(response.StatusCode, response);

                using (var stream = await response.Content.ReadAsStreamAsync())
                {
                    // ReadLineAsync must be cancelled by closing the whole stream.
                    using (cancel.Register(() => stream.Dispose()))
                    {
                        using (var reader = new StreamReader(stream, new UTF8Encoding(false)))
                        {
                            string line;
                            try
                            {
                                while ((line = await reader.ReadLineAsync()) != null)
                                {
                                    var prog = client.JsonSerializer.DeserializeObject<T>(line);
                                    if (prog == null) continue;

                                    progress.Report(prog);
                                }
                            }
                            catch (ObjectDisposedException)
                            {
                                // The subsequent call to reader.ReadLineAsync() after cancellation
                                // will fail because we disposed the stream. Just ignore here.
                            }
                        }
                    }
                }
            }
        }
    }
}