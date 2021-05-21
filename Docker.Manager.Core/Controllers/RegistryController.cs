using Arch.EntityFrameworkCore.UnitOfWork;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Docker.Manager.Model.Base;
using Dockify.Model.Entities;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace Docker.Manager.Core.Controllers
{
    [Produces("application/json")]
    [Route("registry")]
    [EnableCors("teknopalasPolicy")]
    public class RegistryController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<RegistryController> _logger;

        private readonly IUnitOfWork _unitOfWork;

        public RegistryController(
            IConfiguration config,
            ILogger<RegistryController> logger,
            IUnitOfWork unitOfWork
            )
        {
            _config = config;
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Route("list-registry")]
        public async Task<IPagedList<DockerRegistry>> ListRegisrry()
        {
            try
            {
                var result = await _unitOfWork.GetRepository<DockerRegistry>().GetPagedListAsync(
                     pageIndex: 0, pageSize: 50
                     );

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError($"List Registry Error : {ex.Message}");
                return null;
            }
        }


        [HttpGet]
        [Route("getById/{id}")]
        public async Task<DockerRegistry> GetById(Guid id)
        {
            var data = await _unitOfWork.GetRepository<DockerRegistry>().FindAsync(id);
            return data;
        }

        [HttpPost]
        [Route("post")]
        public async Task<IActionResult> Post([FromBody] DockerRegistry value)
        {
            try
            {
                var checkIfExist = await _unitOfWork.GetRepository<DockerRegistry>().GetFirstOrDefaultAsync(predicate: p => p.Name.Equals(value.Name));
                if (checkIfExist != null)
                {
                    _logger.LogInformation($"Name : {value.Name} already exists!");
                    throw new InvalidOperationException($"Name : {value.Name} already exists!");
                }

                var checkIfRegistryExist = await _unitOfWork.GetRepository<DockerRegistry>().GetFirstOrDefaultAsync(predicate: p => p.RegistryUrl.Equals(value.RegistryUrl));
                if (checkIfRegistryExist != null)
                {
                    _logger.LogInformation($"Registry Name : {value.RegistryUrl} already exists!");
                    throw new InvalidOperationException($"Registry Name : {value.RegistryUrl} already exists!");
                }

                var repo = _unitOfWork.GetRepository<DockerRegistry>();
                repo.Insert(value);

                var success = await _unitOfWork.SaveChangesAsync(ensureAutoHistory: true) > 0;

                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Registry-INSERT-ERROR : {ex.Message}");
                return BadRequest(new { id = value.Id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }

        [HttpPut]
        [Route("put/{id}")]
        public async Task<IActionResult> Put([FromBody] DockerRegistry value, Guid id)
        {
            try
            {
                var success = false;
                var repo = await _unitOfWork.GetRepository<DockerRegistry>().FindAsync(id);
                if (repo != null)
                {
                    repo.RegistryUrl = value.RegistryUrl;
                    repo.AuthenticationRequired = value.AuthenticationRequired;
                    repo.Name = value.Name;
                    repo.UserName = value.UserName;
                    repo.Password = value.Password;
                    repo.PersonalAccessToken = value.PersonalAccessToken;

                    success = await _unitOfWork.SaveChangesAsync() > 0;

                }
                return Ok(new { id = value.Id, Success = success, MessageCode = 0, Message = string.Empty });
            }

            catch (Exception ex)
            {
                _logger.LogInformation($"Company-UPDATE-ERROR : {ex.Message}");
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
                var repo = await _unitOfWork.GetRepository<DockerRegistry>().FindAsync(id);
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
                _logger.LogInformation($"Docker-Registry-DELETE-ERROR : {ex.Message}");
                return BadRequest(new { id, Success = false, MessageCode = 0, Message = ex.Message });
            }
        }
    }
}
