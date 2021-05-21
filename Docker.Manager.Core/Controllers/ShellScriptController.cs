using Arch.EntityFrameworkCore.UnitOfWork;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Docker.Manager.Model.Base;
using Dockify.Model.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Mono.Unix;

namespace Dockify.Core.Controllers
{
    [Produces("application/json")]
    [Route("shell-script")]
    [EnableCors("teknopalasPolicy")]
    public class ShellScriptController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ShellScriptController> _logger;
        private readonly string ShFolderPath = $"{Environment.CurrentDirectory.Replace('\\', '/')}/data/media/shellscripts";

        private readonly IUnitOfWork _unitOfWork;

        public ShellScriptController(
            IConfiguration config,
            ILogger<ShellScriptController> logger,
            IUnitOfWork unitOfWork
            )
        {
            _config = config;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("list-shellscript")]
        public async Task<IPagedList<ShellScript>> ListShellScript()
        {
            try
            {
                var result = await _unitOfWork.GetRepository<ShellScript>().GetPagedListAsync(
                    predicate: p => p.RecordState == RecordState.Active,
                    pageIndex: 0, pageSize: 1000
                    );

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"List ShellScript Error : {ex.Message}");
                return null;
            }
        }

        [HttpGet]
        [Route("getById/{id}")]
        public async Task<ShellScript> GetById(Guid id)
        {
            var data = await _unitOfWork.GetRepository<ShellScript>().FindAsync(id);
            return data;
        }

        [HttpPost]
        [Route("post")]
        public async Task<IActionResult> Post([FromBody] ShellScript value)
        {
            try
            {
                var checkIfExist = await _unitOfWork.GetRepository<ShellScript>().GetFirstOrDefaultAsync(predicate: p => p.Name.Equals(value.Name));
                if (checkIfExist != null)
                {
                    _logger.LogInformation($"Name : {value.Name} already exists!");
                    return Ok(new { id = value.Id, Success = false, MessageCode = 0, Message = $"Name : {value.Name} already exists!" });
                }
                var fileName = $"{value.Name.ToLower().Trim().Replace(' ', '_')}.sh";
                var fullPath = $"{ShFolderPath}/{fileName}";

                value.FullPath = fullPath;
                value.FileName = fileName;
                value.Path = ShFolderPath;

                var repo = _unitOfWork.GetRepository<ShellScript>();
                repo.Insert(value);

                var success = await _unitOfWork.SaveChangesAsync(ensureAutoHistory: true) > 0;

                if (success)
                {

                    if (!Directory.Exists(ShFolderPath))
                    {
                        Directory.CreateDirectory(ShFolderPath);
                    }


                    using var stream = System.IO.File.Create(fullPath);

                    if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                    {
                        var unixFileInfo = new UnixFileInfo(fullPath);
                        unixFileInfo.FileAccessPermissions = Get755();
                    }
                    var _content = Encoding.UTF8.GetBytes(value.Content);
                    stream.Write(_content, 0, _content.Length);
                }


                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"ShellScript-INSERT-ERROR : {ex.Message}");
                return BadRequest(new { id = value.Id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }
        [HttpPut]
        [Route("put/{id}")]
        public async Task<IActionResult> Put([FromBody] ShellScript value, Guid id)
        {
            try
            {
                var checkIfExist = await _unitOfWork
                    .GetRepository<ShellScript>()
                    .GetFirstOrDefaultAsync(predicate: p => p.Name.Equals(value.Name));


                var success = false;
                var repo = await _unitOfWork.GetRepository<ShellScript>().FindAsync(id);

                if (checkIfExist != null && checkIfExist.Id != repo.Id)
                {
                    _logger.LogInformation($"Name : {value.Name} is used by another item!");
                    return Ok(new { id = value.Id, Success = false, MessageCode = 0, Message = $"Name : {value.Name} is used by another item!" });
                }

                if (repo != null)
                {
                    var tempFullPath = repo.FullPath;
                    var fileName = $"{value.Name.ToLower().Trim().Replace(' ', '_')}.sh";
                    var fullPath = $"{ShFolderPath}/{fileName}";

                    repo.Name = value.Name;
                    repo.Content = value.Content;
                    repo.FullPath = fullPath;
                    repo.FileName = fileName;
                    repo.Path = ShFolderPath;

                    success = await _unitOfWork.SaveChangesAsync() > 0;
                    if (success)
                    {

                        if (System.IO.File.Exists(tempFullPath))
                        {
                            System.IO.File.Delete(tempFullPath);
                        }

                        using var stream = System.IO.File.Create(repo.FullPath);

                        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                        {
                            var unixFileInfo = new UnixFileInfo(repo.FullPath)
                            {
                                FileAccessPermissions = Get755()
                            };
                        }
                        var _content = Encoding.UTF8.GetBytes(repo.Content);
                        stream.Write(_content, 0, _content.Length);
                    }

                }
                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogInformation($"ShellScript-UPDATE-ERROR : {ex.Message}");
                return BadRequest(new { id = value.Id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("delete/{id}")]
        public async Task<IActionResult> Delete([FromRoute] Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<ShellScript>().FindAsync(id);
                if (repo == null)
                {
                    _logger.LogError("Delete: Docker-Registry-DELETE-ERROR");
                }
                repo.RecordState = RecordState.Deleted;
                success = await _unitOfWork.SaveChangesAsync() > 0;

                return Ok(new { id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogInformation($"ShellScript-DELETE-ERROR : {ex.Message}");
                return BadRequest(new { id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        private static FileAccessPermissions Get755()
        {
            return FileAccessPermissions.UserExecute | FileAccessPermissions.OtherExecute | FileAccessPermissions.GroupExecute | FileAccessPermissions.UserRead | FileAccessPermissions.UserWrite | FileAccessPermissions.OtherRead | FileAccessPermissions.GroupRead;
        }
    }
}
